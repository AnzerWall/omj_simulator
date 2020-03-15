import {Codes, Game, IHandler} from '../system';
import EventDataAction from '../event-data-types/action';
export default abstract class Dispatcher implements IHandler {

    handleEvent(game: Game, code: Codes, data: object): void {
        switch (code) {
            case Codes.EMPTY:
                return;
            case Codes.PHASE_ACTION:
                return this.onPhaseAction(game, data as EventDataAction);
            default:
                return;
        }
    }

    onPhaseAction(game: Game, data: EventDataAction) {

    }
}
