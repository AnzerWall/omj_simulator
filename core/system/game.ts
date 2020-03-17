import {forEach, isNil} from 'lodash';
import Entity from './entity';
import Codes from './codes';
import {Event} from '.';
import IHandler from './ihandler';
import Mana from './mana';
import Runway from './runway'
import EntityData from './entity-data';
import {BattleProperties} from '../fixtures/hero-property-names';
import table from '../fixtures/entity-properties-table';
import * as PhaseUnits from '../units/phase_units'

type Unit=[(game: Game, data: object) => boolean, object, string];

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

    constructor(datas: EntityData[]) {
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
        this.seed = null;

    }

    init(seed: number = 0) {
        this.seed = seed;
        this.manas[0].reset();
        this.manas[1].reset();
        this.runway.reset();
        this.tasks = [];
        this.microTasks = [];
        this.current_entity = 0;
        this.fields = [[], []];
        this.turn = 0;
        this.entities.clear();
        this.isEnd = false;
        this.winner = -1;

        forEach(this.datas, data => {
            const entity = new Entity();

            if (data.team_id < 0 || data.team_id > 1 ){
                console.warn('存在无效实体数据，队伍id无效', data);
                return;
            }
            const properties = table.get(data.id);
            if (!properties) {
                console.warn('存在无效实体数据，实体id无效', data);
                return;
            }

            entity.setTeam(data.team_id);
            entity.setId(data.id);
            entity.setName(properties.name);

            entity.setProperty(BattleProperties.MAX_HP, properties.hp);
            entity.setProperty(BattleProperties.ATK, properties.atk);
            entity.setProperty(BattleProperties.DEF, properties.def);
            entity.setProperty(BattleProperties.SPD, properties.spd);
            entity.setProperty(BattleProperties.CRI, properties.cri);
            entity.setProperty(BattleProperties.CRI_DMG, properties.cri_dmg);

            console.log(`【${data.team_id}】${properties.name}(${data.id})`);
            this.entities.set(entity.entity_id, entity);
            this.runway.addEntity(entity.entity_id, () => (entity.getComputedProperty('spd') || 0));
            this.fields[entity.team_id].push(entity.entity_id);
        });

        this.enqueueTask(PhaseUnits.phaseGameStart, {},'游戏开始');
    }

    process(): boolean {
        if (this.seed === null) return false;
        let unit;
        if (this.microTasks.length) {
            unit = this.microTasks.shift();
        } else if (this.tasks.length) {
            unit = this.tasks.shift();
        }

        if (!unit) {
            this.seed = null;
            return false;
        }

        const [ processor, data, hint ] = unit;

        console.log('处理', hint);

        return processor(this, data);
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
            if (entity.important && // 重要实体
                [0, 1].includes(entity.team_id)) {
                entityCounter[entity.team_id] = entityCounter[entity.team_id]+ 1;
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
            if (e.team_id !== teamId) {
                ret.push(e);
            }
        });

        return ret;
    }


}
