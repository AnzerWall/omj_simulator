import Game from './game';
import Buff, {Effect, Operator} from './buff';

import {isNil, filter, find} from 'lodash';
import {BattleProperties, BattleStatus} from "../fixtures/hero-property-names";
import {values, forEach} from 'lodash';
import Skill from './skill';

let entityCounter = 0;
export default class Entity {
    no: number;

    entityId: number;
    teamId: number; // 队伍id

    tags: string[]; // 实体标志，用于识别实体

    properties: Map<string, number>; // 基础属性，最大生命 攻击等
    buffs: Buff[]; // 附加效果，影响基础属性
    hp: number; // 生命值
    shield: number; // 护盾
    name: string;
    dead: boolean;
    lv: number; // 等级
    skills: Skill[];

    constructor() {
        this.entityId = ++entityCounter;
        this.properties = new Map();
        this.buffs = [];
        this.teamId = 0;
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

    addBuff(buff: Buff) {
        this.buffs.push(buff);
    }

    removeBuff(buff: Buff) {
        const index = this.buffs.indexOf(buff);

        if (index !== -1) {
            this.buffs.splice(index, 1);
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
        const effects: Effect[] = this.buffs.reduce((list: Effect[], buff: Buff) => {
            return list.concat(buff.effects.filter(e => e.propertyName === name));
        }, []); // 过滤出影响该属性的effect

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

    setTeam(teamId: number) {
        this.teamId = teamId;
    }

    setName(name: string) {
        this.name = name;
    }

    // 触发技能
    useSkill(game: Game, no: number, selectedId: number): boolean {
        const skill = this.skills.find(s => s.no === no);

        if (!skill) return false;
        if (skill.check && !skill.check(game, this.entityId)) return false;
        const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(game, this.entityId);
        // TODO 鬼火
        return skill.use ? skill.use(game, this.entityId, selectedId) : false;
    }

    filterBuff(name: string): Buff[] {
        return filter(this.buffs, buff => buff.name === name);
    }

    hasBuff(buf: Buff): boolean {
        return !!find(this.buffs, buff => buff === buf);
    }

    hasBuffNamed(name: string): boolean {
        return !!find(this.buffs, buff => buff.name === name);
    }

}
