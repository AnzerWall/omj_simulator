import {
    Buff,
    Operator,
    BattleProperties,
} from '../../';
import NormalAttack from '../common/normal-attack';
import BuffSkill from '../common/buff-skill';

class ChanChanChanBuff extends Buff {
    constructor(sourceId: number) {
        super(sourceId);
        this.canDispel = true;
        this.canRemove = true;
        this.name = '锵锵锵';
        this.maxCount = 1;
        this.visible = true;

        // 维持一个回合
        this.countDownBySource = true;
        this.countDown = 1;

        // 【增益, 状态】 提升15%暴击
        this.isAffectProperty = true;
        this.isBuff = true;

        this.effects = [{
            propertyName: BattleProperties.CRI,
            op: Operator.ADD,
            value: 0.15
        }];

    }
}

export const amanojakuki_skill1 = new NormalAttack('咚咚');
export const amanojakuki_skill2 = new BuffSkill(2,'锵锵锵', 2 , (_, sourceId) => new ChanChanChanBuff(sourceId));
