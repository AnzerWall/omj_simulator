import {forEach, isNil} from 'lodash';
import Entity from './entity';
import Mana from './mana';
import Runway from './runway';
import EntityData from './entity-data';
import {BattleProperties} from '../fixtures/hero-property-names';
import { HeroTable } from '../heroes';
import * as PhaseUnits from '../units/phase_units';

type Unit = [(game: Game, data: object) => boolean, object, string];

export default class Game {
    rules: object; // 规则表

    output: object[]; // 游戏记录

    datas: EntityData[];

    seed: number | null;
    manas: Mana[]; // 鬼火信息
    runway: Runway; // 行动条位置
    microTasks: Unit[];
    tasks: Unit[];
    current_entity: number; // 当前回合实体
    fields: number[][]; // 场上位置
    turn: number; // 当前回合
    entities: Map<number, Entity>; // 实体列表
    isEnd: boolean; // 是否游戏结束
    winner: number; // 获胜者id

    constructor(datas: EntityData[], seed: number = 0) {
        this.rules = {};
        this.isEnd = false;
        this.winner = -1;
        this.turn = 0;
        this.entities = new Map<number, Entity>();
        this.fields = [[], []];

        this.current_entity = 0;
        this.output = [];

        this.runway = new Runway();
        this.manas = [new Mana(4), new Mana(4)];
        this.tasks = [];
        this.microTasks = [];
        this.datas = datas;
        this.seed = seed;
        this._init();
    }

    _init() {
        forEach(this.datas, data => {

            if (data.team_id < 0 || data.team_id > 1) {
                console.warn('存在无效实体数据，队伍id无效', data);
                return;
            }
            const Hero = HeroTable.get(data.no);
            if (!Hero) {
                console.warn('存在无效实体数据，实体no无效', data);
                return;
            }
            const entity = new Hero();

            entity.setTeam(data.team_id);

            console.log(`【${data.team_id}】${entity.name}(${entity.no})`);
            this.entities.set(entity.entity_id, entity);
            this.runway.addEntity(entity.entity_id, () => (entity.getComputedProperty('spd') || 0));
            this.fields[entity.team_id].push(entity.entity_id);
        });

        this.enqueueTask(PhaseUnits.phaseGameStart, {}, '游戏开始');
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

            console.log('处理', hint);

            return processor(this, data);
        }

        return false;
    }

    enqueueMicroTask(processor: (game: Game, data: object) => boolean, data: object = {}, hint: string = '') {
        this.microTasks.push([processor, data, hint]);
    }

    enqueueTask(processor: (game: Game, data: object) => boolean, data: object = {}, hint: string = '') {
        this.tasks.push([processor, data, hint]);
    }

    judgeWin() {
        const entityCounter: [number, number] = [0, 0];
        this.entities.forEach(entity => {
            if (entity.no && // 重要实体
                [0, 1].includes(entity.team_id) && !entity.dead) {
                entityCounter[entity.team_id] = entityCounter[entity.team_id] + 1;
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

    getRandom(): number {
        return Math.random();
    }

    getEntity(entity_id: number): Entity | null {
        return this.entities.get(entity_id) || null;
    }

    getEnemies(entity_id: number): Entity[] {
        const entity = this.getEntity(entity_id);
        if (!entity) return [];
        const teamId = entity.team_id;

        const ret: Entity[] = [];

        this.entities.forEach((e: Entity) => {
            if (e.team_id !== teamId && !e.dead) {
                ret.push(e);
            }
        });

        return ret;
    }

    action_normal_attack(source: number, target: number, rate: number = 1) {
        const sourceEntity = this.getEntity(source);
        const targetEntity = this.getEntity(target);

        if (!sourceEntity || !targetEntity) return false;

        const damage = sourceEntity.getComputedProperty('atk') * rate;
        const remainHp = Math.max(targetEntity.hp - damage, 0);
        const isDead = remainHp <= 0;

        console.log(`队伍${sourceEntity.team_id}的${sourceEntity.name} 对 队伍${targetEntity.team_id}的${targetEntity.name} 造成${damage}点伤害，其${targetEntity.hp}->${remainHp}`, isDead && '【死亡】');

        targetEntity.hp = remainHp;
        targetEntity.dead = isDead;
        if (isDead) {
            this.runway.freeze(targetEntity.entity_id);
        }

    }

}
