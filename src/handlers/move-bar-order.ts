import { IHandler } from '../core/ihandler';
import { Codes, Event, Game } from '../core';

export default class OrdinaryMoveBar implements IHandler {
    event_priority: number = -1;
    handleEvent(game: Game, code: Codes, data: object): void {
        if (code === Codes.PHASE_MOVE_BAR) { // 开局的行动条排序
            game.enqueueEvent(new Event(Codes.PHASE_TURN_BEGIN)); // 触发先机
        }
    }
}

