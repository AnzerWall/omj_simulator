import { Codes, Event, Game, IHandler } from '../system';

export default class OrdinaryMoveBar implements IHandler {
    handleEvent(game: Game, code: Codes, data: object): void {
        if (code === Codes.PHASE_MOVE_BAR) { // 开局的行动条排序
            game.enqueueEvent(new Event(Codes.PHASE_TURN_BEGIN)); // 触发先机
        }
    }
}
