import {Game, Handler, Skill} from '../../system';
import Attack, {AttackTargetInfo} from '../../system/attack';

export class NormalAttack implements Skill {
    handlers: Handler[];
    no: number;
    passive: boolean;
    rate: number;
    FR: number;
    cost: number;

    constructor(rate = 1.25, FR = 0.01) {
        this.no = 1;
        this.passive = false;
        this.handlers = [];
        this.rate = rate;
        this.FR = FR;
        this.cost = 0;
    }

    use(game: Game, sourceId: number, selectedId: number): boolean {
        const t = new AttackTargetInfo(selectedId);
        t.isSingleDamage = true;
        t.shouldComputeCri = true;
        t.FR = this.FR;
        t.rate = this.rate;
        const attack: Attack = {
            sourceId: sourceId,
            targetsInfo: [t],
        };
        game.actionAttack(attack);
        return true;
    }
}
