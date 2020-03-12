import { forEach } from 'lodash';
import { Entity } from './entity';
import Codes from './codes';
import { Event } from '.';
import IHandler from './ihandler';
import * as Handlers from '../handlers';
import teamIds from '../fixtures/team_ids';

export default class Game {
    event_queue: Event[]; // 事件队列
    handlersMap: { [code: number]: Array<{ priority: number, handler: IHandler}> }; // 事件监听者表
    rules: object; // 规则表
    entities: Map<number, Entity>; // 实体列表
    isEnd: boolean; // 是否游戏结束
    winner: number; // 获胜者id
    turn: number;
    constructor(entities: Entity[]) {
        this.handlersMap = {};
        this.rules = {};
        this.event_queue = [];
        this.isEnd = false;
        this.winner = 0;
        this.turn = 0;
        this.entities = new Map<number, Entity>()
        this._init(entities);
    }

    _init (entities: Entity[]) {
        this.enqueueEvent(new Event(Codes.PHASE_START));

        this.registerHandler(Codes.PHASE_START, Handlers.ordinaryStart);
        this.registerHandler(Codes.PHASE_MOVE_BAR_ORDER, Handlers.ordinaryMoveBarOrder);
        this.registerHandler(Codes.PHASE_SENKI, Handlers.ordinarySenki);

        this.registerHandler(Codes.PHASE_MOVE_BAR, Handlers.ordinaryMoveBar);
        this.registerHandler(Codes.PHASE_TURN_BEGIN, Handlers.ordinaryTurnBegin);
        this.registerHandler(Codes.PHASE_ACTION, Handlers.ordinaryAction);
        this.registerHandler(Codes.PHASE_TURN_END, Handlers.ordinaryTurnEnd);

        forEach(entities, entity => {
            this.entities.set(entity.entity_id, entity);
        });
    }

    // 注册事件
    registerHandler(code: Codes, handler: IHandler): void {
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
    removeHandler(code: Codes, h: IHandler): void {
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
    dispatchEvent(event: Event): void {
        const handlers = this.handlersMap[event.code];
        console.log(`[Event:${Codes[event.code]}]`);
        if (handlers) {
            for (const { handler } of handlers) {
                handler.handleEvent(this, event.code, event.data);

                this.judgeWin();
                if (this.isEnd) {
                    return;
                }
            }
        }

    }

    enqueueEvent(event: Event): void {
        this.event_queue.push(event);
    }

    clearEventQueue(): void {
        this.event_queue = [];
    }

    hasNextEvent(): boolean {
        return !!this.event_queue.length;
    }

    dequeueEvent(): Event | null {
        if (!this.event_queue.length) return null;

        return this.event_queue.shift() || null;
    }

    next_step(): boolean {
        if (this.isEnd || !this.hasNextEvent()) return false;

        const event = this.dequeueEvent();

        if (event) {
            this.dispatchEvent(event);
        }
        return !this.isEnd && true;
    }

    judgeWin() {
        const entityCounter = {
            [teamIds.TEAM1]: 0,
            [teamIds.TEAM2]: 0,
        };
        this.entities.forEach(entity => {
           if (entity.important && // 重要实体
               [ teamIds.TEAM1, teamIds.TEAM2 ].includes(entity.team_id)) {
               entityCounter[entity.team_id] = (entityCounter[entity.team_id] || 0) + 1;
           }
        });

        if (entityCounter[teamIds.TEAM1] === 0 && entityCounter[teamIds.TEAM2] >= 0) {
            this.isEnd = true;
            this.winner = teamIds.TEAM2;
        } else if (entityCounter[teamIds.TEAM1] >= 0 && entityCounter[teamIds.TEAM2] === 0) {
            this.isEnd = true;
            this.winner = teamIds.TEAM1;
        } else if (entityCounter[teamIds.TEAM1] === 0 && entityCounter[teamIds.TEAM2] === 0) {
            this.isEnd = true;
            this.winner = teamIds.TEAM1;
        }
    }
}
