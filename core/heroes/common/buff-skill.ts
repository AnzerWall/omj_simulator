import {Buff, Skill, Handler, Game} from '../../system';
import {Reasons} from '../../fixtures/reasons';

export default class BuffSkill implements Skill {
    no: number;
    name: string;
    cost: number | ((game: Game, entityId: number) => number);
    handlers: Handler[] = [];
    passive: boolean = false;
    buffBuilder: (game: Game, sourceId: number, selectedId: number) => Buff;

    constructor(no: number, name: string, cost: number, buffBuilder: (game: Game, sourceId: number, selectedId: number) => Buff) {
        this.no = no;
        this.name = name;
        this.cost = cost;
        this.buffBuilder = buffBuilder;

    }

    use(game: Game, sourceId: number, selectedId: number): boolean {
        const source = game.getEntity(sourceId);
        if (!source) return false;

        const entities = game.getTeamEntities(source.teamId);
        entities.forEach(e => {
            game.actionAddBuff(sourceId, e.entityId, this.buffBuilder(game, sourceId, selectedId), Reasons.SKILL);
        });

        return true;
    }

};
