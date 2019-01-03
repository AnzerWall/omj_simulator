import { SkillBase } from './skill_base';
import { Member } from '../member';
import { Team } from '../team';
import { Game } from '../game';
import { DAMAGE_TYPE_CRI, DAMAGE_TYPE_NORMAL } from '../common/constant';
// 没有任何特殊功能的普通攻击
export class SkillNormalAttack extends SkillBase {
    rate: number;
    constructor(name: string, rate: number) {
        super(name);

        this.rate = rate;
    }

    action(game: Game, source: Member | any, teammate: Team, enemy: Team, targetType: number, target: Member | any) {
        let damageType = DAMAGE_TYPE_NORMAL;
        const isCri = Math.random() <= source.cri / 100;
        let initDamage = source.atk * this.rate;
        if (isCri) { // 如果暴击
            damageType |= DAMAGE_TYPE_CRI;
            initDamage = initDamage * source.criDM / 100;
        }

        game.actionGiveDamage(source, target, initDamage, damageType);
    }
}
