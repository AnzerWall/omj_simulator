import Codes from './codes';
import Game from './game';

export default interface IHandler {
    handleEvent(game: Game, code: Codes, data: object): void;
}
