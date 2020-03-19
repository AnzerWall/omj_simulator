import Game from './game';
import {BattleProperties} from '../fixtures/hero-property-names';
import {EventData} from '../fixtures/events';

export class AttackTargetInfo {
    targetId: number;
    sourceId: number = 0;
    base: ((game: Game, sourceId: number, targetId: number) => number) | string = BattleProperties.ATK; // 基础数值来源
    limit?: ((game: Game, sourceId: number, targetId: number) => number) | number; // 不超过xxx
    rate: number = 1; // 倍率
    FR: number = 0.01; // 波动值

    isIndirectDamage: boolean = false; // 是否是间接伤害
    isRealDamage: boolean = false; // 是否是真实伤害
    isCriticalDamage: boolean = false; // 是否是暴击伤害

    isNormalAttack: boolean = false; // 是否是普通攻击

    shouldComputeCri: boolean = false; // 是否触发暴击

    noShare: boolean = false; // 不可分摊
    noTriggerEquipment: boolean = false; // 不触发御魂
    noTriggerPassive: boolean = false; // 不触发被动
    noSource: boolean = false; // 视为无来源伤害

    isSingleDamage: boolean = false; // 是否是单体伤害
    isGroupDamage: boolean = false; // 是否是群体伤害

    onComputed?: (game: Game, data: EventData) => boolean; // 完成后

    ////////////// 以下是攻击处理时用到的属性 ////////////////
    // TODO: 独立出来
    critical: number = 0; // 暴击率
    criticalDamage: number = 0; // 暴击伤害

    damageDealtBuff: number = 1; // 造成伤害增加
    damageDealtDebuff: number = 1; // 造成伤害减少
    targetDamageTakenBuff: number = 1; // 目标承受伤害增加
    targetDamageTakenDebuff: number = 1; // 目标承受伤害减少

    targetDefence: number = 0; // 目标防御分子
    damage: number = 0;

    finalDamage: number = 0; // 最终伤害
    isCri: boolean = false; // 是否暴击


    constructor(targetId: number) {
        this.targetId = targetId;
    }
}

export default interface Attack {
    targetsInfo: AttackTargetInfo[]; // 目标
    sourceId: number;
}
