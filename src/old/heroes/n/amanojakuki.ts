import {
    Buff,
    EffectTypes,
    BattleProperties,
} from '../../';
import NormalAttack from '../common/normal-attack';
import BuffSkill from '../common/buff-skill';

export const amanojakuki_skill1 = new NormalAttack('咚咚');
export const amanojakuki_skill2 = new BuffSkill(2,'锵锵锵', 2 , (_, sourceId, targetId) => Buff.build(sourceId, targetId)
    .countDown(1)
    .buffAP(BattleProperties.CRI, EffectTypes.FIXED, 0.15)
    .end()
);
