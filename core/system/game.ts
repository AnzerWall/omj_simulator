import {forEach, isNil} from 'lodash';
import Entity from './entity';
import Mana from './mana';
import Runway from './runway';
import {BattleProperties} from '../fixtures/hero-property-names';
import {HeroTable} from '../heroes';
import * as PhaseUnits from './phase-units';
import {EventCodes, EventData, EventRange} from '../fixtures/events';
import Skill from './skill';
import Attack, {AttackTargetInfo} from './attack';
import {MersenneTwister19937, Random} from 'random-js';
import Buff from './buff';
import {Reasons} from '../fixtures/reasons';
import {Control} from '../fixtures/control';

type Unit = [(game: Game, data: EventData) => boolean, object, string];
// interface Task {
//     step: number,
//     children: Task[], // 任务队列
//     processor: (game: Game, data: EventData, step: number) => number
//     type: string,
//     parent: Task | null,
// }

// const GameTask: Task = {
//     step: 1,
//     children: [],
//     processor(game: Game, data: EventData, step: number): number {
//         return 0;
//     },
//     type: 'Game',
//     parent: null,
// };
//
// interface Team {
//     mana: Mana,
// }

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

    // rootTask: Task;
    // currentTask: Task;

    constructor(datas: {
        no: number;
        teamId: number;
        lv?: number;
        equipments?: number[];
    }[], seed = Math.random()) {
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
            const Hero = HeroTable.get(data.no);
            if (!Hero) {
                console.warn('存在无效实体数据，实体no无效', data);
                return;
            }
            const entity = new Hero();

            entity.setTeam(data.teamId);

            console.log(`【${data.teamId}】${entity.name}(${entity.no})`);
            this.entities.set(entity.entityId, entity);
            this.runway.addEntity(entity.entityId, () => (entity.getComputedProperty('spd') || 0));
            this.fields[entity.teamId].push(entity.entityId);
        });

        this.addProcessor(PhaseUnits.phaseGameStart, {}, '[PHASE_GAME_START] Init');
    }


    process(): boolean {
        if (this.seed === null) return false;
        if (this.isEnd) return false;
        if (this.microTasks.length) {
            this.tasks.unshift(...this.microTasks);
            this.microTasks = [];
        }

        if (this.tasks.length) {
            const unit = this.tasks.shift();
            if (!unit) return false;

            const [processor, data, hint] = unit;

            console.log(hint);

            return processor(this, data);
        }

        return false;
    }

    addProcessor(processor: (game: Game, data: object) => boolean, data: EventData = {}, hint = '') {
        this.microTasks.push([processor, data, hint]);
    }

    dispatch(code: EventCodes, data: EventData = {}): number {
        const eventEntity = this.getEntity(data.eventId || 0);
        let count = 0;
        const units: {
            processor: (game: Game, data: object) => boolean;
            hint: string;
            priority: number;
            skillOwnerId: number;
            skillNo: number;
        } [] = [];

        this.entities.forEach(entity => {
            forEach(entity.skills, (skill: Skill) => {

                forEach(skill.handlers, handler => {
                    if (handler.code === code) {
                        let ok = false;
                        switch (handler.range) {
                            case EventRange.NONE:
                                ok = true;
                                break;
                            case EventRange.SELF:
                                if (data.eventId === entity.entityId) {
                                    ok = true;
                                }
                                break;
                            case EventRange.TEAM:
                                if (data.eventId && eventEntity && eventEntity.teamId === entity.teamId) {
                                    ok = true;
                                }
                                break;
                            case EventRange.ENEMY:
                                if (data.eventId && eventEntity && (1 - eventEntity.teamId) === entity.teamId) {
                                    ok = true;
                                }
                                break;
                            case EventRange.ALL:
                                ok = true;
                                break;
                            default:
                                break;
                        }
                        if (ok) {
                            units.push({
                                processor: handler.handle.bind(this),
                                hint: `[EVENT_${EventCodes[code]}] entity_id = ${entity.entityId} team_id = ${entity.teamId} skill_no = ${skill.no} ${JSON.stringify(data)}`,
                                priority: handler.priority,
                                skillOwnerId: entity.entityId,
                                skillNo: skill.no,
                            });
                            count++;
                        }
                    }
                });
            });
        });

        units.sort((a, b) => {
            return a.priority - b.priority;
        });

        forEach(units, (unit) => {
            this.addProcessor(unit.processor, Object.assign({
                skillOwnerId: unit.skillOwnerId,
                skillNo: unit.skillNo
            }, data), unit.hint);
        });

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

    getRandomEnemy(entityId: number): Entity | null{
        const list: Entity[] = this.getEnemies(entityId);
        if (!list.length) return null;

        return list[this.random.integer(0, list.length - 1)] || null;
    }

    canCost(teamId: number, count: number ): boolean {
        if (teamId < 0 || teamId > 1) return false;

        return this.manas[teamId].num >= count;
    }
    getMana(teamId: number): Mana | null {
        return this.manas[teamId] || null;
    }


    actionAttack(a: Attack): boolean {
        function processTarget(game: Game, data: EventData): boolean {
            if (isNil(data.attack) || isNil(data.step1) || isNil(data.step2)) return false;
            const attack = data.attack;

            const source = game.getEntity(attack.sourceId);
            if (!source) return false;

            const targetInfo: AttackTargetInfo = attack.targetsInfo[data.step1];
            if (!targetInfo) return false;

            const target = game.getEntity(targetInfo.targetId);
            if (!target) return false;

            switch (data.step2) {
                // 数据准备
                case 0: {
                    targetInfo.critical = source.getComputedProperty(BattleProperties.CRI);
                    targetInfo.criticalDamage = source.getComputedProperty(BattleProperties.CRI_DMG);
                    targetInfo.damageDealtBuff = source.getComputedProperty(BattleProperties.DMG_DEALT_B) + 1;
                    targetInfo.damageDealtDebuff = source.getComputedProperty(BattleProperties.DMG_DEALT_D) + 1;

                    targetInfo.targetDamageTakenBuff = target.getComputedProperty(BattleProperties.DMG_TAKEN_B) + 1;
                    targetInfo.targetDamageTakenDebuff = target.getComputedProperty(BattleProperties.DMG_TAKEN_D) + 1;
                    targetInfo.targetDefence = target.getComputedProperty(BattleProperties.DEF);
                    targetInfo.damage = typeof targetInfo.base === 'string' ?
                        source.getComputedProperty(targetInfo.base) :
                        targetInfo.base(game, attack.sourceId, targetInfo.targetId);

                    game.dispatch(EventCodes.BEFORE_ATTACK, {attack, eventId: attack.sourceId}); // 攻击前
                    data.step2 = 1;
                    break;
                }
                // 受到攻击处理
                case 1: {
                    game.dispatch(EventCodes.ATTACK, {attack, eventId: attack.sourceId}); // 攻击时
                    game.dispatch(EventCodes.TAKEN_ATTACK, {attack, eventId: targetInfo.targetId}); // 被攻击时

                    if (targetInfo.shouldComputeCri) {
                        targetInfo.isCri = targetInfo.critical < game.random.real(0, 1) || targetInfo.isCri;
                        if (targetInfo.isCri) {
                            data.step2 = 2;
                        } else {
                            data.step2 = 3;
                        }
                    } else {
                        data.step2 = 3;
                    }
                    break;
                }
                // 暴击处理
                case 2: {
                    targetInfo.isCriticalDamage = true;
                    game.dispatch(EventCodes.CRI, {attack, eventId: attack.sourceId}); // 暴击时
                    data.step2 = 3;
                    break;
                }
                // 伤害处理步骤
                case 3: {
                    const FR = game.random.real(1 - targetInfo.FR, 1 + targetInfo.FR); // 伤害浮动系数
                    const atk = targetInfo.damage * targetInfo.rate * (targetInfo.isCri ? targetInfo.criticalDamage : 1) * 300; // 伤害公式攻击部
                    const def = targetInfo.targetDefence + 300; // 伤害公式防御部
                    const rate = (targetInfo.damageDealtBuff / targetInfo.damageDealtDebuff) *
                        (targetInfo.targetDamageTakenBuff / targetInfo.targetDamageTakenDebuff); // 减伤增伤易伤等计算

                    targetInfo.finalDamage = atk / def * rate * FR;
                    //TODO: 计算盾的抵消伤害

                    game.dispatch(EventCodes.DAMAGE, {attack, eventId: attack.sourceId}); // 造成伤害
                    game.dispatch(EventCodes.TAKEN_DAMAGE, {attack, eventId: targetInfo.targetId}); // 收到伤害时

                    data.step2 = 4;
                    break;
                }
                // 伤害结算步骤
                case 4: {
                    game.actionUpdateHp(targetInfo.noSource ? 0 : attack.sourceId, targetInfo.targetId, -targetInfo.finalDamage);
                    data.step2 = 5;
                    break;
                }
                // 伤害后步骤
                case 5: {
                    if (targetInfo.onComputed) game.addProcessor(targetInfo.onComputed, data, `[ACTION_attack] ${data.step1}-${data.step2}`);
                    if (attack.targetsInfo.length > data.step1 + 1) {
                        data.step1 = data.step1 + 1;
                        data.step2 = 0;
                    } else {
                        return true;
                    }
                    break;
                }
                default:
                    return false;
            }
            game.addProcessor(processTarget, data, `[ACTION_attack] ${data.step1}-${data.step2}`);
            return true;
        }

        if (a.targetsInfo.length) {
            this.addProcessor(processTarget, {attack: a, step1: 0, step2: 0}, '[ACTION_attack] 0-0');
        }
        return true;
    }

    actionUpdateHp(sourceId: number, targetId: number, v: number, reason: Reasons = Reasons.NOTHING): boolean {
        const source = this.getEntity(sourceId);
        const target = this.getEntity(targetId);
        if (!target) return false;
        if (target.dead) return true; // 死了就不要鞭尸了

        this.addProcessor(() => {
            const remainHp = Math.max(target.hp + v, 0);
            const isDead = remainHp <= 0;
            console.log(`${source ? `[ACTION_update_hp] ${source.name}(${source.teamId})` : 'NoSource'}->${target.name}(${target.teamId})  ${target.hp}${v}=${remainHp}`, isDead && '【Dead】');
            target.hp = remainHp;
            target.dead = isDead;
            if (isDead) {
                this.runway.freeze(target.entityId);
            }
            return true;
        }, {}, '[ACTION_update_hp]');
        return true;

    }

    actionUseSkill(no: number, sourceId: number, selectedId: number, reason: Reasons = Reasons.NOTHING): boolean {
        const source = this.getEntity(sourceId);
        if (!source) return false;

        const skill = source.skills.find(s => s.no === no);
        if (!skill) return false;

        if (skill.check && !skill.check(this, sourceId)) return false;
        const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(this, sourceId);

        if (cost > 0) {
           if (!this.actionUpdateMana(source.entityId, source.teamId, -cost, Reasons.COST)) return false;
        }
        return skill.use ? skill.use(this, sourceId, selectedId) : false;
    }

    actionAddBuff(sourceId: number, targetId: number, buff: Buff, reason: Reasons = Reasons.NOTHING): boolean {
        const target = this.getEntity(targetId);
        if (!target) return false;
        this.dispatch(EventCodes.BEFORE_BUFF_GET, {buff, eventId: sourceId, targetId: targetId});
        this.addProcessor((game: Game) => {
            target.addBuff(buff);
            this.dispatch(EventCodes.BUFF_GET, {buff, eventId: sourceId, targetId: targetId});
            return true;
        }, {}, `[ACTION_add_buff] ${sourceId}->${targetId} ${ buff.name + buff.countDown ? `[${buff.countDown}]` : ''}`);
        return true;
    }
    actionAddBuffP(sourceId: number, targetId: number, buff: Buff, probability: number = 1,reason: Reasons = Reasons.NOTHING): boolean {
        const target = this.getEntity(targetId);
        if (!target) return false;
        const source = this.getEntity(sourceId);
        if (!source) return false;
        const hit = probability * (1 + source.getComputedProperty(BattleProperties.EFT_HIT)); // 基础命中×（1+效果命中）
        const isHit = this.random.real(0, 1) < hit;
        if (!isHit) {
            console.log('[ACTION_add_buff_p] 未命中');
            return true;  // 未命中
        }


        const res = 1 + target.getComputedProperty(BattleProperties.EFT_RES); // (1 + 效果抵抗)
        const notRes = this.random.real(0, 1) < hit / res;

        if (notRes) return this.actionAddBuff(sourceId, targetId, buff, reason); // 未抵抗

        // TODO: 处理抵抗
        this.dispatch(EventCodes.CONTROL_RES, {buff, eventId: sourceId, targetId: targetId});
        return true;
    }
    actionRemoveBuff(sourceId: number, targetId: number, buff: Buff, reason: Reasons = Reasons.NOTHING): boolean {
        const target = this.getEntity(targetId);
        if (!target) return false;

        this.dispatch(EventCodes.BEFORE_BUFF_REMOVE, {buff, eventId: sourceId, targetId: targetId});
        this.addProcessor((game: Game) => {
            target.removeBuff(buff);
            game.dispatch(EventCodes.BUFF_REMOVE, {buff, eventId: sourceId, targetId: targetId});
            return true;
        }, {}, '[ACTION_remove_buff]');
        return true;
    }

    actionUpdateMana(sourceId: number, teamId: number, num: number, reason: Reasons = Reasons.NOTHING): boolean {
        const mana = this.manas[teamId];
        if (!mana) return false;
        console.log(`[ACTION_UpdateMana] teamId=${teamId}   ${num}`);
        mana.num = mana.num + num;
        if (mana.num < 0) mana.num = 0;
        if (mana.num > 8) {
            mana.num = 8;
            this.dispatch(EventCodes.MANA_OVERFLOW);
        }

        return true;
    }

    actionUpdateManaProgress(sourceId: number, teamId: number, num: number, reason: Reasons = Reasons.NOTHING): boolean {
        const mana = this.manas[teamId];
        if (!mana) return false;

        mana.progress = mana.progress + num;
        if (mana.progress < 0) mana.progress = 0;
        if (mana.progress > 5) mana.progress = 5;

        return true;
    }
    actionProcessManaProgress(sourceId: number, teamId: number): boolean {
        const mana = this.manas[teamId];
        if (!mana) return false;


        if (mana.progress >= 5) {
            mana.progress = 0;
            mana.preProgress = Math.min(5, mana.preProgress + 1);
            this.actionUpdateMana(0, teamId, mana.preProgress, Reasons.RULE);
        }

        return true;
    }




    // 拉条
    actionUpdateRunwayPercent(sourceId: number, targetId: number, precent: number, reason: Reasons = Reasons.NOTHING): boolean {
        const target = this.getEntity(targetId);
        if (!target) return false;

        return this.runway.updatePercent(targetId, precent);
    }


}
