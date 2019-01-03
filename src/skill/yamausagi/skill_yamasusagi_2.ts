
import { SkillBase } from '../skill_base';
import { Game } from '../../game';
import { Member } from '../../member';
import { Team } from '../../team';
import { BuffNormalAtkRaise } from '../../buff/buff_normal_atk_raise';

/*
    2火
    使友方全体增加30%行动条，并获得【兔子舞】, 持续两个回合
    【兔子舞】: 增益，状态  提升10%的攻击
 */
export class SkillYamasusagi2 extends SkillBase {
    constructor() {
        super('兔子舞', 2);

    }

    action(game: Game, source: Member | any, teammate: Team, enemy: Team, targetType: number, target: Member | any) {
        if (!source.team.energy.canCost(this.cost)) return;
        source.team.energy.cost(this.cost); // 消耗鬼火

        const buff = new BuffNormalAtkRaise('兔子舞', 1.2, 2);

        teammate.members.forEach(m => buff.actionAdd(source, m)); // 附加兔子舞buff
        teammate.members.forEach(m => game.actionTurnBarPercentRaise(source, m, 30));
    }
}
