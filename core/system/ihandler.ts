import Codes from './codes';
import Game from './game';

export default interface IHandler {
    event_priority: number;
    handleEvent(game: Game, code: Codes, data: object): void;
}