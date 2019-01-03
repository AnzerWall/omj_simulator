import { SkillBase } from '../skill_base';
import { Game } from '../../game';
import { Member } from '../../member';
import { Team } from '../../team';
import { DAMAGE_TYPE_CRI, DAMAGE_TYPE_NORMAL } from '../../common/constant';

/**
 * 3火
 * 造成攻击的285%的伤害，并有10%的的基础概率使其变形
 */
export class SkillYamasusagi3 extends SkillBase {
    constructor() {
        super('幸运套环', 3);
    }

    action(game: Game, source: Member, teammate: Team, enemy: Team, targetType: number, target: Member) {
        if (!source.team.energy.canCost(this.cost)) return;
        source.team.energy.cost(this.cost); // 消耗鬼火

        // 伤害部分
        let damageType = DAMAGE_TYPE_NORMAL;

        const isCri = Math.random() <= source.cri / 100;
        let initDamage = source.atk * 2.85;
        if (isCri) { // 如果暴击
            damageType |= DAMAGE_TYPE_CRI;
            initDamage = initDamage * source.criDM / 100;
        }

        game.actionGiveDamage(source, target, initDamage, damageType);

        // TODO: 变形效果
    }
}
