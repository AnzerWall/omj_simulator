import {Game, Handler, Skill} from '../../system';
import Attack, {AttackTargetInfo} from '../../system/attack';

export class NormalAttack implements Skill {
    handlers: Handler[];
    no: number;
    passive: boolean;
    rate: number;
    FR: number;

    constructor(rate: number = 1.25, FR: number = 0.01) {
        this.no = 1;
        this.passive = false;
        this.handlers = [];
        this.rate = rate;
        this.FR = FR;
    }

    check(game: Game, entity_id: number): boolean {
        return true;
    }

    cost(game: Game, entity_id: number): number {
        return 0;
    }

    use(game: Game, source_entity_id: number, selected_entity_id: number): boolean {
        const t = new AttackTargetInfo(selected_entity_id);
        t.isSingleDamage = true;
        t.shouldComputeCri = true;
        t.FR = this.FR;
        t.rate = this.rate;
        const attack: Attack = {
            source_id: source_entity_id,
            targetsInfo: [t],
        };
        game.action_attack(attack);
        return true;
    }
}
