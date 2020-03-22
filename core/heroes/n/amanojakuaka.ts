import {BattleProperties, Buff, Control, EffectTypes, Battle, Reasons, Skill} from '../../';
import NormalAttack from '../common/normal-attack';
import {SkillTarget} from "../../skill";

export const amonojakuaka_skill1 = new NormalAttack('肉弹战车');
export const amonojakuaka_skill2: Skill = {
    no: 2,
    name: '挑衅',
    cost: 2,
    target: SkillTarget.ENEMY,
use(battle: Battle, sourceId: number, selectedId: number): boolean {
        const buff1 = Buff
            .build(sourceId, selectedId)
            .name('挑衅', 1)
            .control(Control.PROVOKE)
            .noDispel() // 不可驱散
            .countDown(1)
            .probability(1) // 基础概率100%
            .end();
        const buff2 = Buff.build(sourceId, selectedId)
            .name('挑衅[增]')
            .countDown(1)
            .buff(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED, 0.2)
            .end();
        const buff3 = Buff.build(sourceId, selectedId)
            .name('挑衅[易]')
            .countDown(1)
            .debuff(BattleProperties.DMG_TAKEN_D, EffectTypes.FIXED, 0.4)
            .end();
        battle.actionAddBuff( buff1, Reasons.SKILL);
        battle.actionAddBuff( buff2, Reasons.SKILL);
        battle.actionAddBuff( buff3, Reasons.SKILL);

        return true;
    },
};
