import Game from './game';

export class AttackTargetInfo {
    targetId: number;

    base: ((game: Game, sourceId: number, targetId: number) => number) | string; // 基础数值来源
    rate: number;
    FR: number;

    isIndirectDamage: boolean; // 是否是间接伤害
    isRealDamage: boolean; // 是否是真实伤害
    isCriticalDamage: boolean; // 是否是暴击伤害
    shouldComputeCri: boolean; // 是否触发暴击

    noTriggerEquipment: boolean; // 不触发御魂
    noTriggerPassive: boolean; // 不触发被动

    isSingleDamage: boolean; // 是否是单体伤害
    isGroupDamage: boolean; // 是否是群体伤害

    critical: number; // 暴击率
    criticalDamage: number; // 暴击伤害

    damageDealtBuff: number; // 造成伤害增加
    damageDealtDebuff: number; // 造成伤害减少
    targetDamageTakenBuff: number; // 目标承受伤害增加
    targetDamageTakenDebuff: number; // 目标承受伤害减少

    targetDefence: number; // 目标防御分子

    damage: number;
    finalDamage: number; // 最终伤害
    isCri: boolean; // 是否暴击
    noSource: boolean;

    constructor(targetId: number) {
        this.targetId = targetId;
        this.isIndirectDamage = false;
        this.isRealDamage = false;
        this.isCriticalDamage = false;
        this.shouldComputeCri = false;

        this.noTriggerEquipment = false;
        this.noTriggerPassive = false;

        this.isSingleDamage = false;
        this.isGroupDamage = false;

        this.critical = 0;
        this.criticalDamage = 1.5;

        this.damageDealtBuff = 1;
        this.damageDealtDebuff = 1;
        this.targetDamageTakenBuff = 1;
        this.targetDamageTakenDebuff = 1;
        this.targetDefence = 0;
        this.finalDamage = 0;
        this.isCri = false;
        this.noSource = false;
        this.FR = 0.01;
        this.base = 'atk';
        this.rate = 1;
        this.damage = 0;
    }
}

export default interface Attack {
    targetsInfo: AttackTargetInfo[]; // 目标
    sourceId: number;
}
