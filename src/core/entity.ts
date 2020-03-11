import Codes from './codes';
import { IHandler } from './ihandler';
import Game from './game';
import Effect, { Operator } from './effect';
import { isNil } from 'lodash';

let entity_counter = 0;

export class Entity implements IHandler {
    event_priority: number = 0;
    entity_id: number;
    properties: Map<string, number>;
    effects: Effect[];
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
        const effects = this.effects.filter(e => e.property_name === name);

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

    handleEvent(game: Game, code: Codes, data: object): void {
    }

}
