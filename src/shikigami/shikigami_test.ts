import { SkillNormalAttack } from '../skill/skill_normal_attack';
import { Member } from '../member';

export class ShikigamiTest extends Member {
    constructor(name?: string, speed?: number) {
        super(name || '测试式神', 10000, speed || 128, 2000, 300, 50, 150, 0, 0);
        const skill1 = new SkillNormalAttack('普攻', 1.25);
        this.addAndSetNormalAttack(skill1);
    }

}
