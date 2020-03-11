import Codes from './codes';
import { IHandler } from './ihandler';
import Game from './game';
let entity_counter = 0;

export class Entity implements IHandler {
    event_priority: number = 0;
    entity_id: number;
    constructor() {
        this.entity_id = ++entity_counter;
    }

    handleEvent(game: Game, code: Codes, data: object): void {
    }

}
