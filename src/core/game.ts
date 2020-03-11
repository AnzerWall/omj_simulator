import { upperFirst, camelCase } from 'lodash';
import { Entity } from './entity';
import Codes from './codes';
import { Event } from '.';
import { IHandler } from './ihandler';

export default class Game {
    event_queue: Event[]; // 事件队列
    handlersMap: { [code: number]: Array<{ priority: number, handler: IHandler}> }; // 事件监听者表
    rules: object; // 规则表
    entities: Map<number, Entity>; // 实体列表
    constructor() {
        this.handlersMap = {};
        this.rules = {};
        this.event_queue = [];
    }

    // 注册事件
    registerHandler(code: Codes, handler: IHandler) {
        if (!this.handlersMap[code]) {
            this.handlersMap[code] = [];
        }
        const priority = handler.event_priority;
        const list = this.handlersMap[code];

        list.push({
            priority,
            handler,
        });

        this.handlersMap[code] = list.sort((a, b) => a.priority - b.priority);
    }
    // 移除事件
    removeHandler(code: Codes, h: IHandler) {
        if (!this.handlersMap[code]) {
            return;
        }

        const list = this.handlersMap[code];

        if (list) {
            const index = list.findIndex(({ handler }) => handler === h);

            if (index !== -1) {
                list.splice(index, 1);
            }
        }

    }
    // 分发事件
    dispatchEvent(event: Event) {

        const handlers = this.handlersMap[event.code];
        console.log(`[Event:${Codes[event.code]}]`);
        if (handlers) {
            for (const { handler } of handlers) {
                handler.handleEvent(this, event.code, event.data);
            }
        }

    }

    enqueueEvent(event: Event) {
        this.event_queue.push(event);
    }

    clearEventQueue() {
        this.event_queue.length = 0;
    }
}
