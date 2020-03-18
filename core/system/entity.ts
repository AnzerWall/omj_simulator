import Codes from './codes';
import Game from './game';
import Effect, {Operator} from './effect';
import {isNil} from 'lodash';
// @ts-ignore
import util from 'util';
import {BattleProperties, BattleStatus} from "../fixtures/hero-property-names";
import {values, forEach} from 'lodash';
import Skill from './skill';

let entity_counter = 0;
export default class Entity {
    no: number;

    entity_id: number;
    team_id: number; // 队伍id

    tags: string[]; // 实体标志，用于识别实体

    properties: Map<string, number>; // 基础属性，最大生命 攻击等
    effects: Effect[]; // 附加效果，影响基础属性
    hp: number; // 生命值
    shield: number; // 护盾
    name: string;
    dead: boolean;
    lv: number; // 等级
    skills: Skill[];

    constructor() {
        this.entity_id = ++entity_counter;
        this.properties = new Map();
        this.effects = [];
        this.team_id = 0;
        this.tags = [];
        this.hp = 1;
        this.shield = 0;
        this.no = 0;
        this.name = '<Unknown>';
        this.dead = false;
        this.lv = 40;
        this.skills = [];

        forEach(values(BattleProperties), key => {
            this.setProperty(key, 0);
        });
        forEach(values(BattleStatus), key => {
            this.setProperty(key, 0);
        });
        this.setProperty(BattleProperties.MAX_HP, 1);
    }

    addSkill(skill: Skill) {
        this.skills.push(skill);
    }
    addTags(tag: string) {
        if (!this.hasTag(tag)) {
            this.tags.push(tag);
        }
    }

    removeTags(tag: string) {
        const index = this.tags.indexOf(tag);

        if (index !== -1) {
            this.tags.splice(index, 1);
        }
    }

    hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }

    addEffect(effect: Effect) {
        this.effects.push(effect);
    }

    removeEffect(effect: Effect) {
        const index = this.effects.indexOf(effect);

        if (index !== -1) {
            this.effects.splice(index, 1);
        }
    }

    getProperty(name: string): number {
        const origin = this.properties.get(name);

        if (isNil(origin)) return 0;
        return origin;
    }

    getComputedProperty(name: string): number {
        const origin = this.properties.get(name);
        if (isNil(origin)) return 0;
        const effects = this.effects.filter(e => e.property_name === name); // 过滤出影响该属性的effect

        return effects.reduce((current, e: Effect) => {
            switch (e.op) {
                case Operator.ADD:
                    return current + e.value;
                case Operator.SET:
                    return e.value;
                case Operator.NOTHING:
                default:
                    return current;
            }
        }, origin);
    }

    hasProperty(name: string): boolean {
        return this.properties.has(name);
    }

    setProperty(name: string, value = 0) {
        this.properties.set(name, value);
    }

    setTeam(team_id: number) {
        this.team_id = team_id;
    }

    setName(name: string) {
        this.name = name;
    }

    // 触发技能
    useSkill(game: Game, no: number, selected_entity_id: number): boolean {
        const skill = this.skills.find(s => s.no === no);

        if (!skill) return false;
        if (!skill.check(game, this.entity_id)) return false;
        if (skill.cost(game, this.entity_id) < 0) return false;

        return skill.use(game, this.entity_id, selected_entity_id);
    }

}
