import {
    Buff,
    Operator,
    BattleProperties,
} from '../../';
import BuffSkill from '../common/buff-skill';
import SingleAttack from '../common/single-attack';

class TeiGinBuff extends Buff {
    constructor(sourceId: number) {
        super(sourceId);
        this.canDispel = true;
        this.canRemove = true;
        this.name = '低吟';
        // TODO: 待确认
        // this.maxCount = 0;    貌似无限制
        this.countDown = 1;
        this.visible = true;

        // 【增益, 状态】 提升40点速度
        this.isAffectProperty = true;
        this.isBuff = true;

        this.effects = [{
            propertyName: BattleProperties.SPD,
            op: Operator.ADD,
            value: 40
        }];

    }
}

export const amonojakuao_skill1 = new SingleAttack(1, '乱打', 0.33, 0, 3, true);
export const amonojakuao_skill2 = new BuffSkill(2, '低吟', 2, (_, sourceId) => new TeiGinBuff(sourceId));
