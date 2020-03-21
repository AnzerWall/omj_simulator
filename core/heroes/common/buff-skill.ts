import {Buff, Skill, Handler, Game, Reasons} from '../../';
import { forEach, isArray } from 'lodash';
type BuffBuilder = (game: Game, sourceId: number, targetId: number) => Buff[] | Buff;
export default class BuffSkill implements Skill {
    no: number;
    name: string;
    cost: number | ((game: Game, entityId: number) => number);
    handlers: Handler[] = [];
    passive: boolean = false;
    buffBuilder: BuffBuilder;

    constructor(no: number, name: string, cost: number, buffBuilder: BuffBuilder) {
        this.no = no;
        this.name = name;
        this.cost = cost;
        this.buffBuilder = buffBuilder;

    }

    use(game: Game, sourceId: number, _: number): boolean {
        const source = game.getEntity(sourceId);
        if (!source) return false;

        const entities = game.getTeamEntities(source.teamId);
        entities.forEach(e => {
            let buffs = this.buffBuilder(game, sourceId, e.entityId);
            if (!isArray(buffs)) buffs = [buffs];

            forEach(buffs, b => game.actionAddBuff(e.entityId, b, Reasons.SKILL));
        });

        return true;
    }

}
