import {forEach} from 'lodash';
import Entity from './entity';
import Mana from './mana';
import Runway from './runway';
import {BattleProperties, Control, EventCodes, Reasons} from './constant';
import {HeroBuilders} from './heroes';
import {EventData, EventRange} from './events';
import Skill from './skill';
import Attack from './attack';
import {MersenneTwister19937, Random} from 'random-js';
import Buff from './buff';
import Task, {Processor} from './task';
import {attackProcessor, gameProcessor} from './tasks';
import Handler from './handler';

type Unit = [(game: Game, data: EventData) => boolean, object, string];


export default class Game {
    rules: object; // 规则表

    output: object[]; // 游戏记录

    seed: number;
    manas: Mana[]; // 鬼火信息
    runway: Runway; // 行动条位置
    microTasks: Unit[];
    tasks: Unit[];
    currentId: number; // 当前回合实体
    fields: number[][]; // 场上位置
    turn: number; // 当前回合
    entities: Map<number, Entity>; // 实体列表
    isEnd: boolean; // 是否游戏结束
    winner: number; // 获胜者id
    random: Random;

    rootTask: Task;
    currentTask: Task;

    constructor(datas: {
        no: number;
        teamId: number;
        lv?: number;
        equipments?: number[];
    }[], seed = Date.now()) {
        this.rules = {};
        this.isEnd = false;
        this.winner = -1;
        this.turn = 0;
        this.entities = new Map<number, Entity>();
        this.fields = [[], []];

        this.currentId = 0;
        this.output = [];

        this.runway = new Runway();
        this.manas = [new Mana(4), new Mana(4)];
        this.tasks = [];
        this.microTasks = [];
        this.seed = seed;
        this.random = new Random(MersenneTwister19937.seed(seed));

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
            this.runway.addEntity(entity.entityId, () => (entity.getComputedProperty('spd') || 0));
            this.fields[entity.teamId].push(entity.entityId);
        });

        this.currentTask = this.rootTask = {
            step: 1,
            children: [],
            processor: gameProcessor,
            type: 'Game',
            parent: null,
            data: {},
            depth: 0,
        };
    }

    process(): boolean {
        if (this.seed === null) return false;
        if (this.isEnd) return false;

        // 当前任务出错
        if (this.currentTask.step === 0) return false;

        // 先处理子任务
        if (this.currentTask.children.length) {
            if (this.currentTask.children[0].step < 0) {
                this.currentTask.children.shift();
                return this.process();
            }
            this.currentTask = this.currentTask.children[0];
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

    addProcessor(processor: Processor, data: EventData = {}, type = '') {
        this.currentTask.children.push({
            step: 1,
            children: [],
            processor,
            type,
            parent: this.currentTask,
            data,
            depth: this.currentTask.depth + 1,
        });
    }

    addEventProcessor(code: EventCodes, eventId: number, data: EventData = {}): number {
        const eventEntity = this.getEntity(eventId || 0);

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

        this.addProcessor((game: Game, _, step: number) => {
            if (step <= 0) return 0;
            if (step > units.length) return -1;
            const unit = units[step - 1];
            const entity = this.getEntity(unit.skillOwnerId);
            if (!entity) return 0;
            if (unit.handler.passive && entity.beControlledBy(Control.PASSIVE_FORBID)) return step + 1; // 被封印被动跳过处理

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

    getEntity(entityId: number): Entity | null {
        return this.entities.get(entityId) || null;
    }

    getTeamEntities(teamId: number): Entity[] {
        const ret: Entity[] = [];

        this.entities.forEach((e: Entity) => {
            if (e.teamId === teamId && !e.dead) {
                ret.push(e);
            }
        });
        return ret;
    }

    getEnemies(entityId: number): Entity[] {
        const entity = this.getEntity(entityId);
        if (!entity) return [];
        const teamId = entity.teamId;
        const isConfusion = entity.beControlledBy(Control.CONFUSION);

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

    canCost(teamId: number, count: number): boolean {
        if (teamId < 0 || teamId > 1) return false;

        return this.manas[teamId].num >= count;
    }

    getMana(teamId: number): Mana | null {
        return this.manas[teamId] || null;
    }

    actionAttack(attack: Attack) {
        this.addProcessor(attackProcessor, {attack}, 'Attack');
        return true;
    }

    actionUpdateHp(sourceId: number, targetId: number, num: number, reason: Reasons = Reasons.NOTHING): boolean {
        const source = this.getEntity(sourceId);
        const target = this.getEntity(targetId);
        if (!target) return false;
        if (target.dead) return true; // 死了就不要鞭尸了

        this.addProcessor((game: Game, data: EventData, step: number) => {
            switch (step) {
                case 1: {
                    data.remainHp = Math.max(target.hp + num, 0);
                    data.isDead = data.remainHp <= 0;
                    game.log(`${source ? `【${source.name}(${source.teamId})】` : ''}${num < 0 ? '减少' : '恢复'}【${target.name}(${target.teamId})】${Math.abs(num)}点血， 剩余${data.remainHp}`, data.isDead ? '【死亡】' : '');
                    return 2;
                }
                case 2: {
                    if (data.remainHp === undefined || data.isDead === undefined) return 0;
                    target.hp = data.remainHp;
                    target.dead = data.isDead;
                    if (data.isDead) {
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
        if (!source) return false;
        const skill = source.skills.find(s => s.no === no);
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
        this.addProcessor((game: Game, data: EventData, step: number) => {
            const source = this.getEntity(sourceId);
            if (!source) return 0;
            const selected = this.getEntity(selectedId);
            if (!selected) return 0;
            const skill = source.skills.find(s => s.no === no);
            if (!skill) return 0;
            switch (step) {
                case 1 : {
                    if (skill.check && !skill.check(this, sourceId)) return 0;
                    const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(this, sourceId);
                    game.log(`【${source.name}(${source.teamId})】对【${selected.name}(${selected.teamId})】使用技能【${skill.name}】`);

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

    actionAddBuff(sourceId: number, targetId: number, buff: Buff, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor((game: Game, data: EventData, step: number) => {
            const target = this.getEntity(targetId);
            if (!target) return 0;
            const source = this.getEntity(sourceId);
            switch (step) {
                case 1: {
                    this.addEventProcessor(EventCodes.BEFORE_BUFF_GET, targetId,{buff, targetId: targetId});
                    game.log(`${source ? `【${source.name}(${source.teamId})】` : ''}对【${target.name}(${target.teamId})】添加 【${buff.name}】 Buff`,
                        buff.countDown > 0 ? buff.countDownBySource ? '维持' : '持续' + buff.countDown + '回合' : '');

                    return 2;
                }
                case 2: {
                    target.addBuff(buff);
                    this.addEventProcessor(EventCodes.BUFF_GET, targetId, {buff, targetId: targetId});
                    return -1;
                }
            }
            return 0;
        }, {sourceId, targetId, buff, reason}, 'AddBuff');
    }

    actionAddBuffP(sourceId: number, targetId: number, buff: Buff, num: number = 1, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor(() => {
            const target = this.getEntity(targetId);
            if (!target) return 0;
            const source = this.getEntity(sourceId);
            if (!source) return 0;
            const hit = num * (1 + source.getComputedProperty(BattleProperties.EFT_HIT)); // 基础命中×（1+效果命中）
            const isHit = this.random.real(0, 1) < hit;
            if (!isHit) {
                return -1;  // 未命中
            }

            const res = 1 + target.getComputedProperty(BattleProperties.EFT_RES); // (1 + 效果抵抗)
            const notRes = this.random.real(0, 1) < hit / res;

            if (notRes) {
                this.actionAddBuff(sourceId, targetId, buff, reason);
                return -1;
            }

            // TODO: 处理抵抗
            this.addEventProcessor(EventCodes.BUFF_RES,  targetId,{buff, targetId: targetId});
            return -1;
        }, {sourceId, targetId, buff, num, reason}, 'AddBuffP');
    }

    actionRemoveBuff(sourceId: number, targetId: number, buff: Buff, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor((game: Game, _: EventData, step: number) => {
            const target = this.getEntity(targetId);
            if (!target) return 0;
            switch (step) {
                case 1: {
                    this.addEventProcessor(EventCodes.BEFORE_BUFF_REMOVE, targetId, {buff, targetId: targetId});
                    return 2;
                }
                case 2: {
                    target.removeBuff(buff);
                    game.addEventProcessor(EventCodes.BUFF_REMOVE, targetId, {buff, targetId: targetId});
                    return -1;
                }
            }
            return 0;
        }, {sourceId, targetId, buff, reason}, 'RemoveBuff');
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
    actionUpdateRunwayPercent(sourceId: number, targetId: number, precent: number, reason: Reasons = Reasons.NOTHING) {
        this.addProcessor((game: Game) => {
            const target = this.getEntity(targetId);
            if (!target) return 0;
            return game.runway.updatePercent(targetId, precent) ? -1 : 0;
        }, {sourceId, targetId, precent, reason}, 'UpdateRunwayPercent');
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
            parent: task.parent ? '<parent>' : null,
            data: task.data,
        };
    }

}
