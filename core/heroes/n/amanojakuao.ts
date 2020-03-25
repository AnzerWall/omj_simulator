import {
    Buff,
    EffectTypes,
    BattleProperties,
} from '../../';
import BuffSkill from '../common/buff-skill';
import SingleAttack from '../common/single-attack';

export const amonojakuao_skill1 = new SingleAttack(1, '乱打', 0.33, 0, 3, true);
export const amonojakuao_skill2 = new BuffSkill(2, '低吟', 2, (_, sourceId, targetId) =>
    Buff.build(sourceId, targetId)
        .name('低吟', 1)
        .countDown(1)
        .buffAP(BattleProperties.SPD, EffectTypes.FIXED, 40)
        .end()
);
