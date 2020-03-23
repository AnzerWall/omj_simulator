import {Attack, AttackInfo, AttackParams, Battle, BattleProperties, EventCodes, Healing, HealingParams} from '../index';
import healing from '../healing';

class HealingInfo {
    originHp: number = 0; // 原hp
    originValue: number = 0; // 基础治疗量
    healingDown: number = 0; // 减疗
    healingUp: number = 0; // 增疗
    finalValue: number = 0;
    critical: number = 0; // 暴击率
    criticalDamage: number = 0; // 暴击伤害
    isCri: boolean = false;

    remainHp: number = 0;
}

export class HealingProcessing {
    index: number = 0;
    healingInfos: HealingInfo[] = [];
    healings: Healing[] = [];
}

export default function healingProcessor(battle: Battle, data: HealingProcessing, step: number): number {
    const healing = data.healings[data.index];
    if (!healing) return 0;

    const source = battle.getEntity(healing.sourceId);
    const target = battle.getEntity(healing.targetId);
    switch (step) {
        // 数据准备
        case 1: {
            const healingInfo = data.healingInfos[data.index] = new HealingInfo();

            healingInfo.healingDown = battle.getComputedProperty(target.entityId, BattleProperties.HEALING_DOWN);
            healingInfo.healingUp = battle.getComputedProperty(source.entityId, BattleProperties.HEALING_UP);
            healingInfo.critical = battle.getComputedProperty(source.entityId, BattleProperties.CRI);
            healingInfo.criticalDamage = battle.getComputedProperty(source.entityId, BattleProperties.CRI_DMG);

            healingInfo.originValue = typeof healing.base === 'string' ?
                battle.getComputedProperty(target.entityId, BattleProperties.MAX_HP)
                : healing.base(battle, healing.sourceId, healing.targetId);
            battle.addEventProcessor(EventCodes.BEFORE_HEALING, healing.sourceId, data);

            return 2;
        }
        case 2: {
            if (healing.hasParam(HealingParams.SHOULD_COMPUTE_CRI)) {
                return 3;
            }
            return 4;
        }
        case 3: {
            const healingInfo = data.healingInfos[data.index];
            if (!healingInfo) return 0;

            healingInfo.isCri = healingInfo.isCri || battle.testHit(healingInfo.criticalDamage);
            healing.addParam(HealingParams.CRITICAL);
            return 4;
        }
        case 4: {
            const healingInfo = data.healingInfos[data.index];
            if (!healingInfo) return 0;

            healingInfo.finalValue = healingInfo.originValue * healing.rate * (1 - healingInfo.healingDown) + (1 + healingInfo.healingUp);
            healingInfo.originHp = target.hp;
            healingInfo.remainHp = target.hp + healingInfo.finalValue;
            battle.addEventProcessor(EventCodes.WILL_HEAL, healing.sourceId, data);
            battle.addEventProcessor(EventCodes.WILL_BE_HEALED, healing.targetId, data);
            return 5;
        }
        case  5: {
            const healingInfo = data.healingInfos[data.index];
            if (!healingInfo) return 0;
            target.hp = healingInfo.remainHp;
            battle.addEventProcessor(EventCodes.HAS_HEALED, healing.sourceId, data);
            battle.addEventProcessor(EventCodes.HAS_BEEN_HEALED, healing.targetId, data);
            return 6;
        }
        case 6: {

            if (data.index + 1 >= data.healingInfos.length) return -1;
            data.index++;
            return 2;

        }
    }

    return 0;

}
