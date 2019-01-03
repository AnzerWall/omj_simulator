import { SkillNormalAttack } from '../skill/skill_normal_attack';
import { Member } from '../member';
import { SkillYamasusagi2 } from '../skill/yamausagi/skill_yamasusagi_2';
import { TARGET_TYPE_TEAMMATE_ALL } from '../common/constant';
import { SkillYamasusagi3 } from '../skill/yamausagi/skill_yamasusagi_3';

export class ShikigamiYamausagi extends Member {
    constructor(name?: string) {
        super(name || '山兔', 10709.48, 115, 2894.40, 432.18, 8, 150, 0, 0);
        const skill1 = new SkillNormalAttack('普攻', 1.25); // 谁还不听话
        const skill2 = new SkillYamasusagi2(); // 兔子舞
        const skill3 = new SkillYamasusagi3();

        this.addAndSetNormalAttack(skill1);
        this.addSkill(skill2, 1);

    }

    action(): void {

        if (this.team.energy.canCost(this.skills[1].cost) && // 拥有足够使用【兔子舞】的鬼火
            !this.team.members.some(m => (m as Member).haveThisNameBuff('兔子舞')) // 全部队友均未拥有【兔子舞】buff
        ) {
            // 使用兔子舞
            this.skills[1].action(this.game, this, this.team, this.team.enemy, TARGET_TYPE_TEAMMATE_ALL, null);
            return;
        }

        super.action();
    }

}
