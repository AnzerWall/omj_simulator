import {filter, forEach, isArray, some} from 'lodash';
import Entity from './entity';
import Mana from './mana';
import Runway from './runway';
import { BuffParams, Control, EventCodes, Reasons} from './constant';
import {HeroBuilders} from './heroes';
import {EventData, EventRange, RemoveBuffProcessing, AddBuffProcessing} from './events';
import Skill from './skill';
import {AttackInfo} from './attack';
import {MersenneTwister19937, Random} from 'random-js';
import Buff, { Effect, EffectTypes} from './buff';
import Task, {Processor} from './task';
import {addBuffProcessor, attackProcessor, battleProcessor, removeBuffProcessor} from './tasks';
import Handler from './handler';


export default class Battle {

    output: object[]; // 游戏记录

    seed: number;
    manas: Mana[]; // 鬼火信息
    runway: Runway; // 行动条位置
    currentId: number; // 当前回合实体
    fields: number[][]; // 场上位置
    turn: number; // 当前回合
    entities: Map<number, Entity>; // 实体列表
    isEnd: boolean; // 是否游戏结束
    winner: number; // 获胜者id
    random: Random;

    rootTask: Task; // 根任务节点
    currentTask: Task; // 当前处理的任务节点
    taskCounter: number; // 分配任务id用的计数器

    buffs: Buff[];

    constructor(datas: {
        no: number;
        teamId: number;
        lv?: number;
        equipments?: number[];
    }[], seed = Date.now()) {
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

            console.log(`【${data.teamId}】${entity.name}(${entity.no})(${entity.entityId})`);
            this.entities.set(entity.entityId, entity);
            this.runway.addEntity(entity.entityId, () => (this.getComputedProperty(entity.entityId,'spd') || 0));
            this.fields[entity.teamId].push(entity.entityId);
        });
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

    addProcessor(processor: Processor, data: EventData = {}, type = ''): number {
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

    addEventProcessor(code: EventCodes, eventId: number, data: EventData = {}): number {
        const eventEntity = eventId === 0 ? null :this.getEntity(eventId);

        let count = 0;
        const units: {
            handler: Handler;
            skillOwnerId: number;
            skillNo: number;
        } [] = [];
        this.entities.forEach(entity => {
            forEach(entity.skills, (skill: Skill) => {
                forEach(skill.handlers, handler => {
                    if (handler.code !== code) return;
                    if (eventId && eventEntity) {
                        if (handler.range === EventRange.SELF && eventId === entity.entityId) return;
                        if (handler.range === EventRange.TEAM && eventEntity.teamId !== entity.teamId) return;
                        if (handler.range === EventRange.ENEMY && (1 - eventEntity.teamId) !== entity.teamId) return;
                    }
                    units.push({
                        handler,
                        skillOwnerId: entity.entityId,
                        skillNo: skill.no,
                    });
                    count++;
                });
            });
        });

        units.sort((a, b) => {
            return a.handler.priority - b.handler.priority;
        });

        this.addProcessor((battle: Battle, _, step: number) => {
            if (step <= 0) return 0;
            if (step > units.length) return -1;
            const unit = units[step - 1];
            const entity = this.getEntity(unit.skillOwnerId);
            if (unit.handler.passive && battle.hasBuffByControl(unit.skillOwnerId, Control.PASSIVE_FORBID)) return step + 1; // 被封印被动跳过处理

            this.log(`${entity.name}(${entity.entityId})的${unit.skillNo}技能事件触发`);
            this.addProcessor(unit.handler.handle, Object.assign({
                skillOwnerId: unit.skillOwnerId,
                skillNo: unit.skillNo
            }, data), `EventProcess(${EventCodes[code]})`);

            return step + 1;
        }, data, `Event(${EventCodes[code]})`);
        return count;
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
        if (!ret)  throw new Error(`Cannot found entity, id = ${entityId}`);
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

    getRandomEnemy(entityId: number): Entity | null {
        const list: Entity[] = this.getEnemies(entityId);
        if (!list.length) return null;

        return list[this.random.integer(0, list.length - 1)] || null;
    }

    getComputedProperty(entity_id: number, name: string): number {
        const entity = this.getEntity(entity_id);
        const origin = entity.properties.get(name);
        if (origin === undefined) throw new Error(`Cannot found property in entity which id=${entity_id} named by ${name}`);
        const effects: Effect[] = this.buffs.reduce((list: Effect[], buff: Buff) => {
            if (buff.ownerId !== entity_id && entity_id !== -1) return list; // 不是全局buff或者是持有的buff，忽略
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
        return filter(this.buffs,  buff => buff.ownerId === ownerId && buff.name === name);
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
            return buff.ownerId === ownerId &&buff.params.includes(BuffParams.CONTROL) && !!buff.control && controls.includes(buff.control)
        });
    }



    actionAttack(attackInfos: AttackInfo[] | AttackInfo) {
        if (!isArray(attackInfos)) attackInfos = [attackInfos];
        this.addProcessor(attackProcessor, {attackInfos}, 'Attack');
        return true;
    }

    actionUpdateHp(sourceId: number, targetId: number, num: number, reason: Reasons = Reasons.NOTHING): boolean {
        const source = this.getEntity(sourceId);
        const target = this.getEntity(targetId);
        if (!target) return false;
        if (target.dead) return true; // 死了就不要鞭尸了

        this.addProcessor((battle: Battle, data: EventData, step: number) => {
            switch (step) {
                case 1: {
                    data.remainHp = Math.max(target.hp + num, 0);
                    data.isDead = data.remainHp <= 0;
                    battle.log(`${source ? `【${source.name}(${source.teamId})】` : ''}${num < 0 ? '减少' : '恢复'}【${target.name}(${target.teamId})】${Math.abs(num)}点血， 剩余${data.remainHp}`, data.isDead ? '【死亡】' : '');
                    return 2;
                }
                case 2: {
                    if (data.remainHp === undefined || data.isDead === undefined) return 0;
                    target.hp = data.remainHp;
                    target.dead = data.isDead;

                    if (data.isDead) {
                        const field = this.fields[target.teamId];
                        if (field) {
                            const index = field.indexOf(target.entityId);
                            if (index !== -1) {
                                field[index] = 0;
                            }
                        }


                        this.runway.freeze(target.entityId);
                    }
                    return -1;
                }
            }
            return 0;
        }, {sourceId, targetId, num, reason}, 'UpdateHp');
        return true;

    }

    actionCheckAndUseSkill(no: number, sourceId: number, selectedId: number, reason: Reasons = Reasons.NOTHING): boolean {
        const source = this.getEntity(sourceId);
        const skill = source.getSkill(no);
        if (!skill) return false;
        if (skill.check && !skill.check(this, sourceId)) return false;
        const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(this, sourceId);
        if (cost > 0) {
            const mana = this.getMana(source.teamId);
            if (!mana) return false;

            if (cost > mana.num) return false;
        }
        this.actionUseSkill(no, sourceId, selectedId, reason);
        return true;
    }

    actionUseSkill(no: number, sourceId: number, selectedId: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor((battle: Battle, data: EventData, step: number) => {
            const source = this.getEntity(sourceId);
            const selected = this.getEntity(selectedId);
            const skill = source.getSkill(no);
            switch (step) {
                case 1 : {
                    if (skill.check && !skill.check(this, sourceId)) return 0;
                    const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(this, sourceId);
                    battle.log(`【${source.name}(${source.teamId})】对【${selected.name}(${selected.teamId})】使用技能【${skill.name}】`);

                    if (cost > 0) {
                        this.actionUpdateMana(source.entityId, source.teamId, -cost, Reasons.COST);
                    }
                    return 2;
                }
                case 2: {
                    (skill.use && skill.use(this, sourceId, selectedId));
                    return -1;
                }
            }
            return 0;
        }, {no, sourceId, selectedId, reason}, 'UseSkill');

    }

    actionAddBuff(buff: Buff, reason: Reasons = Reasons.NOTHING) {
        const addBuffProcessing = new AddBuffProcessing(buff, reason);
        this.addProcessor(addBuffProcessor, { addBuffProcessing }, 'AddBuff');
    }

    actionRemoveBuff(buff: Buff, reason: Reasons = Reasons.NOTHING) {
        const removeBuffProcessing = new RemoveBuffProcessing(buff, reason);
        this.addProcessor(removeBuffProcessor, {removeBuffProcessing}, 'RemoveBuff');
    }

    actionUpdateMana(sourceId: number, teamId: number, num: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(() => {
            const mana = this.manas[teamId];
            if (!mana) return 0;
            mana.num = mana.num + num;
            if (mana.num < 0) return 0;
            if (mana.num > 8) {
                mana.num = 8;
                this.addEventProcessor(EventCodes.MANA_OVERFLOW, 0, { sourceId, teamId, num, reason });
            }
            return -1;
        }, {sourceId, teamId, num, reason}, 'UpdateMana');
    }

    actionUpdateManaProgress(sourceId: number, teamId: number, num: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(() => {
            const mana = this.manas[teamId];
            if (!mana) return 0;

            mana.progress = mana.progress + num;
            if (mana.progress < 0) mana.progress = 0;
            if (mana.progress > 5) mana.progress = 5;
            return -1;
        }, {sourceId, teamId, reason}, 'ProcessManaProgress');
    }

    actionProcessManaProgress(sourceId: number, teamId: number) {
        this.addProcessor(() => {
            const mana = this.manas[teamId];
            if (!mana) return 0;
            if (mana.progress >= 5) {
                mana.progress = 0;
                mana.preProgress = Math.min(5, mana.preProgress + 1);
                this.actionUpdateMana(0, teamId, mana.preProgress, Reasons.RULE);
            }

            return -1;
        }, {sourceId, teamId}, 'ProcessManaProgress');
    }

    // 拉条
    actionUpdateRunwayPercent(sourceId: number, targetId: number, percent: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor((battle: Battle) => {
            return battle.runway.updatePercent(targetId, percent) ? -1 : 0;
        }, {sourceId, targetId, percent, reason}, 'UpdateRunwayPercent');
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
