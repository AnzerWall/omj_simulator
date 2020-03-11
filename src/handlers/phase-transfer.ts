import { IHandler } from '../core/ihandler';
import { Codes, Event, Game } from '../core';

export default class PhaseTransfer implements IHandler {
    constructor(public currentPhase: Codes, public nextPhase: Codes) {}
    event_priority: number = -1;
    handleEvent(game: Game, code: Codes, data: object): void {
        if (code === this.currentPhase) {
            game.enqueueEvent(new Event(this.nextPhase)); // 回合开始的下一步是回合结束
        }
    }
}

export function build(currentPhase: Codes, nextPhase: Codes): IHandler {
    return new PhaseTransfer(currentPhase, nextPhase);
}
