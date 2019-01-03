import { Game } from '../game';
import { Member } from '../member';
import { Team } from '../team';

export class SkillBase {
    name: string;
    cost: number;
    constructor(name: string, cost: number = 0) {
        this.name = name;
        this.cost = cost;
    }

    action(game: Game, source: Member, teammate: Team, enemy: Team, targetType: number, target: Member) {

    }
}
