import Game from './core/game';
import * as Handles from './handlers';
import { Codes, Event } from './core';
function sleep(ms: number): void {
    const current = Date.now();
    while (Date.now() - current < ms);
}
export default class OrdinaryGame extends Game {
    constructor() {
        super();
        this.registerHandler(Codes.PHASE_START, Handles.ordinaryStart);
        this.registerHandler(Codes.PHASE_MOVE_BAR_ORDER, Handles.ordinaryMoveBarOrder);
        this.registerHandler(Codes.PHASE_SENKI, Handles.ordinarySenki);

        this.registerHandler(Codes.PHASE_MOVE_BAR, Handles.ordinaryMoveBar);
        this.registerHandler(Codes.PHASE_TURN_BEGIN, Handles.ordinaryTurnBegin);
        this.registerHandler(Codes.PHASE_ACTION, Handles.ordinaryAction);
        this.registerHandler(Codes.PHASE_TURN_END, Handles.ordinaryTurnEnd);
    }

    run() {
        this.enqueueEvent(new Event(Codes.PHASE_START));

        while (this.event_queue.length) {
            const event = this.event_queue.shift();
            this.dispatchEvent(event);
            sleep(100);
        }
    }
}
