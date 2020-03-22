import {Buff, Skill, Handler, Battle, Reasons} from '../../';
import { forEach, isArray } from 'lodash';
import {SkillTarget} from "../../skill";
type BuffBuilder = (battle: Battle, sourceId: number, targetId: number) => Buff[] | Buff;
export default class BuffSkill implements Skill {
    no: number;
    name: string;
    cost: number | ((battle: Battle, entityId: number) => number);
    handlers: Handler[] = [];
    passive: boolean = false;
    buffBuilder: BuffBuilder;
    target: SkillTarget =  SkillTarget.TEAM;
    constructor(no: number, name: string, cost: number, buffBuilder: BuffBuilder) {
        this.no = no;
        this.name = name;
        this.cost = cost;
        this.buffBuilder = buffBuilder;
    }

    use(battle: Battle, sourceId: number, _: number): boolean {
        const source = battle.getEntity(sourceId);

        const entities = battle.getTeamEntities(source.teamId);
        entities.forEach(e => {
            let buffs = this.buffBuilder(battle, sourceId, e.entityId);
            if (!isArray(buffs)) buffs = [buffs];

            forEach(buffs, b => battle.actionAddBuff(b, Reasons.SKILL));
        });

        return true;
    }

}
