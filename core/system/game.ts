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

    constructor(datas: {
        no: number;
        teamId: number;
        lv?: number;
        equipments?: number[];
    }[], seed = 0) {
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

    getEnemies(entityId: number): Entity[] {
        const entity = this.getEntity(entityId);
        if (!entity) return [];
        const teamId = entity.teamId;

        const ret: Entity[] = [];

        this.entities.forEach((e: Entity) => {
            if (e.teamId !== teamId && !e.dead) {
                ret.push(e);
            }
        });

        return ret;
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
                case 5: {
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

    actionUpdateHp(sourceId: number, targetId: number, v: number, reason = 0): boolean {
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

    actionUseSkill(no: number, sourceId: number, selectedId: number): boolean {
        const source = this.getEntity(sourceId);
        if (!source) return false;

        const skill = source.skills.find(s => s.no === no);
        if (!skill) return false;

        if (skill.check && !skill.check(this, sourceId)) return false;
        const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(this, sourceId);
        // TODO 鬼火
        return skill.use ? skill.use(this, sourceId, selectedId) : false;
    }

    actionAddBuff(sourceId: number, targetId: number, buff: Buff): boolean {
        const target = this.getEntity(targetId);
        if (!target) return false;
        this.addProcessor((game: Game) => {
            target.addBuff(buff);
            game.dispatch(EventCodes.BUFF_GET, {buff, eventId: sourceId, targetId: targetId});
            return true;
        }, {}, '[ACTION_add_buff]');
        return true;
    }

    actionRemoveBuff(sourceId: number, targetId: number, buff: Buff): boolean {
        const target = this.getEntity(targetId);
        if (!target) return false;

        this.addProcessor((game: Game) => {
            target.removeBuff(buff);
            game.dispatch(EventCodes.BUFF_REMOVE, {buff, eventId: sourceId, targetId: targetId});
            return true;
        }, {}, '[ACTION_remove_buff]');
        return true;
    }

    // action_dead(source_id: number, target_id: number, reason: number): boolean {
    //     const source = this.getEntity(source_id);
    //     const target = this.getEntity(target_id);
    // }

}
