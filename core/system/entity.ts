import Codes from './codes';
import IHandler from './ihandler';
import Game from './game';
import Effect, { Operator } from './effect';
import { isNil } from 'lodash';
// @ts-ignore
import util from 'util';
let entity_counter = 0;

export class Entity implements IHandler {
    entity_id: number;
    properties: Map<string, number>; // 基础属性，最大生命 攻击等
    effects: Effect[]; // 附加效果，影响基础属性
    team_id: number; // 队伍id
    important: boolean; // 决定是否是重要实体，一方不存在重要实体时另一方获胜
    tags: string[]; // 实体标志，用于识别实体

    constructor() {
        this.entity_id = ++entity_counter;
        this.properties = new Map();
        this.effects = [];
        this.important = false;
        this.team_id = 0;
        this.tags = [];
    }

    addTags(tag: string) {
        if (!this.hasTag(tag)) {
            this.tags.push(tag);
        }
    }

    removeTags(tag: string) {
        const index = this.tags.indexOf(tag);

        if (index !== -1) {
            this.tags.splice(index,1);
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

    getProperty(name: string) {
        const origin = this.properties.get(name);

        if (isNil(origin)) return null;
        return origin;
    }



    getComputedProperty(name: string) {
        const origin = this.properties.get(name);
        if (isNil(origin)) return null;
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

    setProperty(name: string, value = 0) {
        this.properties.set(name, value);
    }

    setTeam(team_id: number) {
        this.team_id = team_id;
    }

    handleEvent(game: Game, code: Codes, data: object): void {
    }

    // toJSON() {
    //     const ret: any = {};
    //
    //     ret.entity_id = this.entity_id;
    //
    //     this.properties.forEach((value, key) => {
    //        // ret[key] = value;
    //        ret[key + '[computed]'] = this.getComputedProperty(key);
    //     });
    //     return ret;
    //
    // }
    //
    // [util.inspect.custom]() {
    //     return JSON.stringify(this.toJSON(), null, 2);
    // }

}
