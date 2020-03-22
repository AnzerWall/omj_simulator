import {AttackParams, BattleProperties, EventCodes, EventData, Battle} from '../';

export function attackSubProcessor(battle: Battle, data: EventData, step: number) {
    const {attackInfos, attackInfo} = data;
    if (!attackInfo) return 0;

    const source = battle.getEntity(attackInfo.sourceId);
    const target = battle.getEntity(attackInfo.targetId);

    switch (step) {
        // 数据准备
        case 1: {
            attackInfo.critical = battle.getComputedProperty(source.entityId, BattleProperties.CRI);
            attackInfo.criticalDamage = battle.getComputedProperty(source.entityId, BattleProperties.CRI_DMG);
            attackInfo.damageDealtBuff = battle.getComputedProperty(source.entityId, BattleProperties.DMG_DEALT_B) + 1;
            attackInfo.damageDealtDebuff = battle.getComputedProperty(source.entityId, BattleProperties.DMG_DEALT_D) + 1;

            attackInfo.targetDamageTakenBuff = battle.getComputedProperty(target.entityId, BattleProperties.DMG_TAKEN_B) + 1;
            attackInfo.targetDamageTakenDebuff = battle.getComputedProperty(target.entityId, BattleProperties.DMG_TAKEN_D) + 1;
            attackInfo.targetDefence = battle.getComputedProperty(target.entityId, BattleProperties.DEF);
            attackInfo.damage = typeof attackInfo.base === 'string' ?
                battle.getComputedProperty(source.entityId, attackInfo.base) :
                attackInfo.base(battle, attackInfo.sourceId, attackInfo.targetId);

            battle.log(`【${source.name}(${source.teamId})】攻击【${target.name}(${target.teamId})】`);
            battle.addEventProcessor(EventCodes.BEFORE_ATTACK, attackInfo.sourceId, { attackInfos, attackInfo }); // 攻击前

            return 2;
        }
        // 受到攻击处理
        case 2: {
            battle.addEventProcessor(EventCodes.ATTACK,  attackInfo.sourceId, { attackInfo }); // 攻击时
            battle.addEventProcessor(EventCodes.TAKEN_ATTACK, attackInfo.targetId, { attackInfo }); // 被攻击时
            return 3;
        }
        case 3:{
            if (attackInfo.hasParam(AttackParams.SHOULD_COMPUTE_CRI)) {
                attackInfo.isCri = attackInfo.isCri || battle.testHit(attackInfo.criticalDamage);
                if (attackInfo.isCri) {
                    attackInfo.addParam(AttackParams.CRITICAL);
                    battle.addEventProcessor(EventCodes.CRI, attackInfo.sourceId, {attackInfo}); // 暴击时
                }
            }
            return 4;
        }
        // 伤害处理步骤
        case 4: {
            const FR = battle.random.real(1 - attackInfo.FR, 1 + attackInfo.FR); // 伤害浮动系数
            const atk = attackInfo.damage * attackInfo.rate * (attackInfo.isCri ? attackInfo.criticalDamage : 1) * 300; // 伤害公式攻击部
            const def = attackInfo.targetDefence + 300; // 伤害公式防御部
            const rate = (attackInfo.damageDealtBuff / attackInfo.damageDealtDebuff) *
                (attackInfo.targetDamageTakenBuff / attackInfo.targetDamageTakenDebuff); // 减伤增伤易伤等计算

            attackInfo.finalDamage = atk / def * rate * FR;
            //TODO: 计算盾的抵消伤害

            battle.addEventProcessor(EventCodes.DAMAGE, attackInfo.sourceId,{attackInfo}); // 造成伤害
            battle.addEventProcessor(EventCodes.TAKEN_DAMAGE, attackInfo.targetId, {attackInfo}); // 收到伤害时

            return 5;
        }
        // 伤害结算步骤
        case 5: {
            battle.actionUpdateHp(attackInfo.hasParam(AttackParams.IGNORE_SOURCE) ? 0 : attackInfo.sourceId, attackInfo.targetId, -attackInfo.finalDamage);
            return 6;
        }
        // 伤害后步骤
        case 6: {
            if (attackInfo.completedProcessor) {
                battle.addProcessor(attackInfo.completedProcessor, { attackInfo, attackInfos}, `AttackCompletedProcessor`);
            } // 伤害后处理，一般处理伤害时的控制
            return -1;
        }
    }
    return 0;
}

export default function attackProcessor(battle: Battle, {attackInfos}: EventData, step: number): number {
    if (!attackInfos) return 0;
    if (step <= 0) return 0;
    if (step > attackInfos.length) return -1;
    const attackInfo = attackInfos[step - 1];
    battle.addProcessor(attackSubProcessor, { attackInfo, attackInfos}, 'AttackSub');
    return step + 1;
}
