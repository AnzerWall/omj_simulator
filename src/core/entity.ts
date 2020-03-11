import Codes from './codes';
import { IHandler } from './ihandler';
import Game from './game';
import Effect, { Operator } from './effect';
import { isNil } from 'lodash';
import util from 'util';
let entity_counter = 0;

export class Entity implements IHandler {
    event_priority: number = 0;
    entity_id: number;
    properties: Map<string, number>; // 基础属性，最大生命 攻击等
    effects: Effect[]; // 附加效果，影响基础属性

    constructor() {
        this.entity_id = ++entity_counter;
        this.properties = new Map();
        this.effects = [];
    }

    addEffect(effect) {
        this.effects.push(effect);
    }
    removeEffect(effect) {
        const index = this.effects.indexOf(effect);

        if (index !== -1) {
            this.effects.splice(index, 1);
        }
    }

    getProperty(name) {
        const origin = this.properties.get(name);

        if (isNil(origin)) return null;

        return origin;
    }

    getComputedProperty(name) {
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

    setProperty(name, value = 0) {
        this.properties.set(name, value);
    }

    handleEvent(game: Game, code: Codes, data: object): void {
    }

    toJSON() {
        const ret: any = {};

        ret.event_priority = this.event_priority;
        ret.entity_id = this.entity_id;

        this.properties.forEach((value, key) => {
           ret[key] = value;
           ret[key + '[computed]'] = this.getComputedProperty(key);
        });
        return ret;

    }

    [util.inspect.custom]() {
        return JSON.stringify(this.toJSON(), null, 2);
    }

}
