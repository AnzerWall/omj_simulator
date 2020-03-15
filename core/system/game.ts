import { forEach, isNil } from 'lodash';
import { Entity } from './entity';
import Codes from './codes';
import { Event } from '.';
import IHandler from './ihandler';
import * as Handlers from '../handlers';
import teamIds from '../fixtures/team_ids';
import Mana from './mana';
import Runway from './runway'

export default class Game {
    event_queue: Event[]; // 事件队列
    handlersMap: { [code: number]: Array<{ priority: number, handler: IHandler}> }; // 事件监听者表
    rules: object; // 规则表
    entities: Map<number, Entity>; // 实体列表
    isEnd: boolean; // 是否游戏结束
    winner: number; // 获胜者id
    turn: number; // 当前回合
    fields: number[][]; // 场上位置
    manas: Mana[]; // 鬼火信息
    runway: Runway; // 行动条位置
    current_entity: number; // 当前回合实体
    constructor(entities: Entity[]) {
        this.handlersMap = {};
        this.rules = {};
        this.event_queue = [];
        this.isEnd = false;
        this.winner = 0;
        this.turn = 0;
        this.entities = new Map<number, Entity>();
        this.fields = [[], []];
        this.manas = [new Mana(4), new Mana(4)];
        this.runway = new Runway(); // 行动条
        this.current_entity = 0;
        this._init(entities);
    }

    _init (entities: Entity[]) {
        this.enqueueEvent(new Event(Codes.PHASE_START));

        this.registerHandler(Codes.PHASE_START, Handlers.ordinaryStart, -1);
        this.registerHandler(Codes.PHASE_MOVE_BAR_ORDER, Handlers.ordinaryMoveBarOrder, -1);
        this.registerHandler(Codes.PHASE_SENKI, Handlers.ordinarySenki, -1);

        this.registerHandler(Codes.PHASE_MOVE_BAR, Handlers.ordinaryMoveBar, -1);
        this.registerHandler(Codes.PHASE_TURN_BEGIN, Handlers.ordinaryTurnBegin, -1);
        this.registerHandler(Codes.PHASE_ACTION, Handlers.ordinaryAction, -1);
        this.registerHandler(Codes.PHASE_TURN_END, Handlers.ordinaryTurnEnd, -1);

        forEach(entities, entity => {
            this.entities.set(entity.entity_id, entity);
            this.runway.addEntity(entity.entity_id, () => (entity.getComputedProperty('spd') || 0));
            if (entity.team_id === teamIds.TEAM1 || entity.team_id === teamIds.TEAM2) {
                this.fields[entity.team_id].push(entity.entity_id);
            }
        });
    }

    // 注册事件
    registerHandler(code: Codes, handler: IHandler, priority = 0): void {
        if (!this.handlersMap[code]) {
            this.handlersMap[code] = [];
        }
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

    getEntity(entity_id: number) :Entity|null {
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
