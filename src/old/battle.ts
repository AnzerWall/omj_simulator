import {filter, forEach, isArray, some} from 'lodash';
import Entity from './entity';
import Mana from './mana';
import Runway from './runway';
import {BuffParams, Control, EventCodes, EventRange, Reasons, BattleProperties} from './constant';
import {HeroBuilders} from './heroes';
import Skill, {SelectableSkill} from './skill';
import {MersenneTwister19937, Random} from 'random-js';
import Buff, {Effect, EffectTypes} from './buff';
import Task, {Processor} from './task';
import {
    AddBuffProcessing,
    addBuffProcessor,
    AttackProcessing,
    attackProcessor,
    battleProcessor,
    EventProcessing,
    eventProcessor, RealEventData,
    RemoveBuffProcessing,
    removeBuffProcessor,
    // UpdateHpProcessing,
    // updateHpProcessor,
    updateManaProcessor,
    UpdateManaProgressProcessing,
    updateManaProcessProcessor,
    UpdateRunWayProcessing,
    UseSkillProcessing,
    useSkillProcessor,
    UpdateNanaProcessing,
    FakeTurnProcessing,
    updateRunwayProcessor,
} from "./tasks";
import Attack from "./attack";
import healingProcessor, {HealingProcessing} from './tasks/healing';
import {Healing} from './index';

interface InititalData {
    no: number;
    teamId: number;
    lv?: number;
    equipments?: number[];
    max_hp?: number;
    atk?: number;
    def?: number;
    spd?: number;
    cri?: number;
    cri_dmg?: number;
    eft_hit?: number;
    eft_res?: number;
    waitInput?: boolean;
}
export default class Battle {

    output: object[]; // 游戏记录

    seed: number;
    manas: Mana[]; // 鬼火信息
    runway: Runway; // 行动条位置
    currentId: number; // 当前回合实体
    fields: number[][]; // 场上位置
    fieldSize: number;

    turn: number; // 当前回合
    entities: Map<number, Entity>; // 实体列表
    isEnd: boolean; // 是否游戏结束
    winner: number; // 获胜者id
    random: Random;

    rootTask: Task; // 根任务节点
    currentTask: Task; // 当前处理的任务节点
    taskCounter: number; // 分配任务id用的计数器

    buffs: Buff[];

    fakeTurns: FakeTurnProcessing[];

    constructor(datas: InititalData[], seed = Date.now()) {
        this.isEnd = false;
        this.winner = -1;
        this.turn = 0;
        this.entities = new Map<number, Entity>();
        this.fields = [[], []];

        this.currentId = 0;
        this.output = [];

        this.runway = new Runway();
        this.manas = [new Mana(4), new Mana(4)];
        this.seed = seed;
        this.random = new Random(MersenneTwister19937.seed(seed));
        this.buffs = [];
        this.fakeTurns = [];
        this.fieldSize = 0;

        forEach(datas, data => {
            if (data.teamId < 0 || data.teamId > 1) {
                console.warn('存在无效实体数据，队伍id无效', data);
                return;
            }
            const builder = HeroBuilders.get(data.no);
            if (!builder) {
                console.warn('存在无效实体数据，实体no无效', data);
                return;
            }
            const entity = builder();

            entity.setTeam(data.teamId);
            entity.waitInput = !!data.waitInput;
            if (data.max_hp && data.max_hp >= 1 && data.max_hp <= 1e10) entity.setProperty(BattleProperties.MAX_HP, data.max_hp);
            if (data.atk && data.atk >= 0 && data.atk <= 100000) entity.setProperty(BattleProperties.ATK, data.atk);
            if (data.def && data.def >= 0 && data.def <= 100000) entity.setProperty(BattleProperties.DEF, data.def);
            if (data.spd && data.spd >= 0 && data.spd <= 1000) entity.setProperty(BattleProperties.SPD, data.spd);
            if (data.eft_hit && data.eft_hit >= 0 && data.eft_hit <= 10000) entity.setProperty(BattleProperties.EFT_HIT, data.eft_hit);
            if (data.eft_res && data.eft_res >= 0 && data.eft_res <= 10000) entity.setProperty(BattleProperties.EFT_RES, data.eft_res);
            if (data.cri && data.cri >= 0 && data.cri <= 10) entity.setProperty(BattleProperties.CRI, data.cri);
            if (data.cri_dmg && data.cri_dmg >= 0 && data.cri_dmg <= 10) entity.setProperty(BattleProperties.CRI_DMG, data.cri_dmg);
            entity.syncHp();
            
            console.log(`【${data.teamId}】${entity.name}(${entity.no})(${entity.entityId})`);
            this.entities.set(entity.entityId, entity);
            this.runway.addEntity(entity.entityId, () => (this.getComputedProperty(entity.entityId, 'spd') || 0));
            this.fields[entity.teamId].push(entity.entityId);
        });
        this.fieldSize = Math.max(this.fields[0].length, this.fields[1].length);
        this.taskCounter = 0;
        this.currentTask = this.rootTask = {
            step: 1,
            children: [],
            processor: battleProcessor,
            type: 'Battle',
            parent: null,
            data: {},
            depth: 0,
            taskId: ++this.taskCounter,
        };
    }

    process(): boolean {
        if (this.seed === null) return false;
        if (this.isEnd) return false;

        // step === 0 出错
        // step < 0 任务结束 目前只有-1
        // step > 0 任务进行到step阶段
        // 当前任务出错
        if (this.currentTask.step === 0) return false;

        // 先处理子任务
        if (this.currentTask.children.length) {
            if (this.currentTask.children[0].step < 0) { // 该子任务已结束
                this.currentTask.children.shift();
                return this.process();
            }
            this.currentTask = this.currentTask.children[0]; // 切换到处理子任务
            return this.process();
        }

        if (this.currentTask.step > 0) {
            // 如果当前任务进行中
            if (this.currentTask.step === 1) this.log();
            const step = this.currentTask.processor(this, this.currentTask.data, this.currentTask.step);
            this.currentTask.step = step === void 0 ? -1 : step;
            return true;
        } else {
            // 如果当前任务已完成
            // 尝试退回到父亲任务节点
            if (!this.currentTask.parent) {
                this.isEnd = true;
                return false;
            }
            this.currentTask = this.currentTask.parent;
            return this.process();
        }
    }

    addFakeTurn(currentId: number, processor: Processor, data: any = {}) {
        const ft = new FakeTurnProcessing(processor, data, currentId);
        const index = this.fakeTurns.findIndex(ft => ft.currentId === currentId);
        if (index !== -1) { // 同名覆盖
            this.fakeTurns.splice(index, 1);
        }

        return this.fakeTurns.push(ft);
    }


    addProcessor(processor: Processor, data: any = {}, type = ''): number {
        const task = {
            step: 1,
            children: [],
            processor,
            type,
            parent: this.currentTask,
            data,
            depth: this.currentTask.depth + 1,
            taskId: ++this.taskCounter,
        };
        this.currentTask.children.push(task);
        return task.taskId;
    }

    addEventProcessor(code: EventCodes, eventId: number, data?: any): number {
        const eventEntity = eventId <= 0 ? null : this.getEntity(eventId);
        const processing: EventProcessing = new EventProcessing(code);
        this.entities.forEach(entity => {
            forEach(entity.skills, (skill: Skill) => {
                forEach(skill.handlers, handler => {
                    if (handler.code !== code) return;
                    if (eventId > 0 && eventEntity) {
                        if (handler.range === EventRange.SELF) {
                            if (eventId !== entity.entityId) return;
                        }
                        if (handler.range === EventRange.TEAM) {
                            if (eventEntity.teamId !== entity.teamId) return;
                        }
                        if (handler.range === EventRange.ENEMY) {
                            if (eventEntity.teamId == entity.teamId) return;
                        }
                    }
                    processing.units.push(new RealEventData(entity.entityId, skill.no, eventId, handler, data));
                });
            });
        });

        processing.units.sort((a, b) => {
            return a.handler.priority - b.handler.priority;
        });

        return this.addProcessor(eventProcessor, processing, `Event(${EventCodes[code]})`);
    }

    judgeWin() {
        const entityCounter: [number, number] = [0, 0];
        this.entities.forEach(entity => {
            if (entity.no && // 重要实体
                [0, 1].includes(entity.teamId) && !entity.dead) {
                entityCounter[entity.teamId] = entityCounter[entity.teamId] + 1;
            }
        });
        if (entityCounter[0] === 0 && entityCounter[1] >= 0) {
            this.isEnd = true;
            this.winner = 1;
        } else if (entityCounter[0] >= 0 && entityCounter[1] === 0) {
            this.isEnd = true;
            this.winner = 0;
        } else if (entityCounter[0] === 0 && entityCounter[1] === 0) {
            this.isEnd = true;
            this.winner = 0;
        }
    }

    getEntity(entityId: number): Entity {
        const ret = this.entities.get(entityId);
        if (!ret) throw new Error(`Cannot found entity, id = ${entityId}`);
        return ret;
    }

    getTeamEntities(teamId: number): Entity[] {
        const ret: Entity[] = [];
        forEach(this.fields[teamId], entity_id => {
            if (entity_id) {
                ret.push(this.getEntity(entity_id));
            }
        });
        return ret;
    }

    getEnemies(entityId: number): Entity[] {
        const entity = this.getEntity(entityId);
        const teamId = entity.teamId;
        const isConfusion = this.hasBuffByControl(entity.entityId, Control.CONFUSION);

        const ret: Entity[] = [];

        this.entities.forEach((e: Entity) => {
            if (e.entityId === entityId) return; // 自己不是自己的敌人
            if (e.dead) return; // 跳过死亡单位
            if (e.teamId < 0 || e.teamId > 1) return; // 过滤非玩家单位
            if (!isConfusion && e.teamId === teamId) return; // 不是混乱状态下不能打自己人
            ret.push(e);
        });

        return ret;
    }

    testHit(p: number): boolean {
        return this.random.real(0, 1) <= p;
    }

    getRandomOne<T>(arr: T[]): T {
        return arr[this.random.integer(0, arr.length - 1)];
    }

    getRandomEnemy(entityId: number): Entity | null {
        const list: Entity[] = this.getEnemies(entityId);
        if (!list.length) return null;

        return list[this.random.integer(0, list.length - 1)] || null;
    }

    getComputedProperty(entityId: number, name: string): number {
        const entity = this.getEntity(entityId);
        const origin = entity.properties.get(name);
        if (origin === undefined) throw new Error(`Cannot found property in entity which id=${entityId} named by ${name}`);
        const effects: Effect[] = this.buffs.reduce((list: Effect[], buff: Buff) => {
            if (buff.ownerId !== entityId && (entityId !== entity.teamId - 2 || entity.entityId === -3)) return list; // 不是全局buff或者是持有的buff，忽略    -2 表示队伍0   -1 表示队伍1   -3表示双方队伍
            if (!buff.hasParam(BuffParams.AFFECT_PROPERTY)) return list; // 不影响属性的buff跳过
            if (!buff.effect) return list; // 未提供effect属性跳过
            if (buff.effect.propertyName !== name) return list; // 不是影响该属性跳过
            if (buff.hasParam(BuffParams.DEPEND_ON)) {
                if (this.buffs.every(b =>
                    b.buffId !== buff.dependBuffId && !(b.ownerId === b.dependBuffId && b.name === b.dependBuffName)  // 依赖 不存在
                )) {
                    return list;
                }
            }
            return list.concat([buff.effect]);
        }, []); // 过滤出影响该属性的effect

        return effects.reduce((current, e: Effect) => {
            switch (e.effectType) {
                case EffectTypes.FIXED:
                    return current + e.value;
                case EffectTypes.SET:
                    return e.value;
                case EffectTypes.ADD_RATE:
                    return current + origin * e.value;
                case EffectTypes.MAX:
                    return Math.max(current, e.value);
                case EffectTypes.MIN:
                    return Math.min(current, e.value);
                default:
                    return current;
            }
        }, origin);
    }

    canCost(teamId: number, count: number): boolean {
        if (teamId < 0 || teamId > 1) return false;

        return this.manas[teamId].num >= count;
    }

    getMana(teamId: number): Mana {
        if (!this.manas[teamId]) throw new Error('Cannot get mana by teamId = ' + teamId);

        return this.manas[teamId];
    }

    filterBuffByName(ownerId: number, name: string): Buff[] {
        return filter(this.buffs, buff => buff.ownerId === ownerId && buff.name === name);
    }

    filterBuffByParam(ownerId: number, ...params: BuffParams[]): Buff[] {
        return filter(this.buffs, buff => buff.ownerId === ownerId && params.some(p => buff.params.includes(p)));
    }

    filterBuffByControl(ownerId: number, ...controls: Control[]): Buff[] {
        return filter(this.buffs, buff => {
            return buff.ownerId === ownerId && buff.params.includes(BuffParams.CONTROL) && !!buff.control && controls.includes(buff.control)
        });
    }

    filterBuffBySource(ownerId: number, sourceId: number): Buff[] {
        return filter(this.buffs, buff => {
            return buff.ownerId === ownerId && buff.sourceId === sourceId;
        });
    }

    hasBuffByName(ownerId: number, name: string): boolean {
        return some(this.buffs, buff => buff.ownerId === ownerId && buff.name === name);
    }

    hasBuffByParam(ownerId: number, ...params: BuffParams[]): boolean {
        return some(this.buffs, buff => buff.ownerId === ownerId && params.some(p => buff.params.includes(p)));
    }

    hasBuffByControl(ownerId: number, ...controls: Control[]): boolean {
        return some(this.buffs, buff => {
            return buff.ownerId === ownerId && buff.params.includes(BuffParams.CONTROL) && !!buff.control && controls.includes(buff.control)
        });
    }


    actionAttack(attacks: Attack[] | Attack) {
        const ap = new AttackProcessing();
        if (!isArray(attacks)) ap.attacks = [attacks];
        else ap.attacks = attacks;
        this.addProcessor(attackProcessor, ap, 'Attack');
        return true;
    }

    actionHeal(healings: Healing[] | Healing) {
        const hp = new HealingProcessing();
        if (!isArray(healings)) hp.healings = [healings];
        else hp.healings = healings;
        this.addProcessor(healingProcessor, hp, 'Heal');
        return true;
    }

    // actionUpdateHp(sourceId: number, targetId: number, num: number, reason: Reasons = Reasons.NOTHING) {
    //     return this.addProcessor(updateHpProcessor, new UpdateHpProcessing(sourceId, targetId, num, reason) , 'UpdateHp');
    // }


    actionUseSkill(no: number, sourceId: number, selectedId: number, cost: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(useSkillProcessor, new UseSkillProcessing(no, sourceId, selectedId, cost, reason), 'UseSkill');

    }

    actionAddBuff(buff: Buff, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(addBuffProcessor, new AddBuffProcessing(buff, reason), 'AddBuff');
    }

    actionRemoveBuff(buff: Buff, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(removeBuffProcessor, new RemoveBuffProcessing(buff, reason), 'RemoveBuff');
    }

    actionUpdateMana(sourceId: number, teamId: number, num: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(updateManaProcessor, new UpdateNanaProcessing(sourceId, teamId, num, reason), 'UpdateMana');
    }

    actionUpdateManaProgress(sourceId: number, teamId: number, num: number, reason: Reasons = Reasons.NOTHING) {
        return this.addProcessor(updateManaProcessProcessor, new UpdateManaProgressProcessing(sourceId, teamId, num, reason), 'ProcessManaProgress');
    }

    // 拉条
    actionUpdateRunwayPercent(sourceId: number, targetId: number, percent: number, reason: Reasons = Reasons.NOTHING) {
        return this.addProcessor(updateRunwayProcessor, new UpdateRunWayProcessing(sourceId, targetId, percent, reason), 'UpdateRunwayPercent');
    }

    log = (...args: any[]) => {
        console.log(' '.repeat(this.currentTask.depth) + `[${this.currentTask.type || '<Unknown>'}][step${this.currentTask.step}]`, ...args);
    };

    dump(task: Task | undefined): any {
        if (task === undefined) task = this.rootTask;
        return {
            step: task.step,
            children: task.children.map(c => this.dump(c)),
            type: task.type,
            data: task.data,
            depth: task.depth,
        };
    }

}
