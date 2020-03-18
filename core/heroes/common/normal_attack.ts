import {Game, Handler, Skill} from '../../system';

export class NormalAttack implements Skill {
    handlers: Handler[];
    no: number;
    passive: boolean;
    rate: number;

    constructor(rate: number = 1.25) {
        this.no = 1;
        this.passive = false;
        this.handlers = [];
        this.rate = rate;
    }

    check(game: Game, entity_id: number): boolean {
        return true;
    }

    cost(game: Game, entity_id: number): number {
        return 0;
    }

    use(game: Game, source_entity_id: number, selected_entity_id: number): boolean {
        game.action_normal_attack(source_entity_id, selected_entity_id, this.rate);
        return true;
    }
}
