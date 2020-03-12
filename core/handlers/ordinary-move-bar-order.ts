import { Codes, Event, Game, IHandler } from '../system';

export default class OrdinaryMoveBarOrder implements IHandler {
        event_priority: number = -1;
        handleEvent(game: Game, code: Codes, data: object): void {
            if (code === Codes.PHASE_MOVE_BAR_ORDER) { // 开局的行动条排序
                game.enqueueEvent(new Event(Codes.PHASE_SENKI)); // 触发先机
            }
        }
    }
