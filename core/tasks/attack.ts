import {AttackParams, BattleProperties, EventCodes, EventData, Game} from '../';

export function attackSubProcessor(game: Game, data: EventData, step: number) {
    const {attackInfos, attackInfo} = data;
    if (!attackInfo) return 0;

    const source = game.getEntity(attackInfo.sourceId);
    if (!source) return 0;
    const target = game.getEntity(attackInfo.targetId);
    if (!target) return 0;

    switch (step) {
        // 数据准备
        case 1: {
            attackInfo.critical = source.getComputedProperty(BattleProperties.CRI);
            attackInfo.criticalDamage = source.getComputedProperty(BattleProperties.CRI_DMG);
            attackInfo.damageDealtBuff = source.getComputedProperty(BattleProperties.DMG_DEALT_B) + 1;
            attackInfo.damageDealtDebuff = source.getComputedProperty(BattleProperties.DMG_DEALT_D) + 1;

            attackInfo.targetDamageTakenBuff = target.getComputedProperty(BattleProperties.DMG_TAKEN_B) + 1;
            attackInfo.targetDamageTakenDebuff = target.getComputedProperty(BattleProperties.DMG_TAKEN_D) + 1;
            attackInfo.targetDefence = target.getComputedProperty(BattleProperties.DEF);
            attackInfo.damage = typeof attackInfo.base === 'string' ?
                source.getComputedProperty(attackInfo.base) :
                attackInfo.base(game, attackInfo.sourceId, attackInfo.targetId);

            game.log(`【${source.name}(${source.teamId})】攻击【${target.name}(${target.teamId})】`);
            game.addEventProcessor(EventCodes.BEFORE_ATTACK, attackInfo.sourceId, { attackInfos, attackInfo }); // 攻击前

            return 2;
        }
        // 受到攻击处理
        case 2: {
            game.addEventProcessor(EventCodes.ATTACK,  attackInfo.sourceId, { attackInfo }); // 攻击时
            game.addEventProcessor(EventCodes.TAKEN_ATTACK, attackInfo.targetId, { attackInfo }); // 被攻击时
            return 3;
        }
        case 3:{
            if (attackInfo.hasParam(AttackParams.SHOULD_COMPUTE_CRI)) {
                attackInfo.isCri = attackInfo.isCri || game.testHit(attackInfo.criticalDamage);
                if (attackInfo.isCri) {
                    attackInfo.addParam(AttackParams.CRITICAL);
                    game.addEventProcessor(EventCodes.CRI, attackInfo.sourceId, {attackInfo}); // 暴击时
                }
            }
            return 4;
        }
        // 伤害处理步骤
        case 4: {
            const FR = game.random.real(1 - attackInfo.FR, 1 + attackInfo.FR); // 伤害浮动系数
            const atk = attackInfo.damage * attackInfo.rate * (attackInfo.isCri ? attackInfo.criticalDamage : 1) * 300; // 伤害公式攻击部
            const def = attackInfo.targetDefence + 300; // 伤害公式防御部
            const rate = (attackInfo.damageDealtBuff / attackInfo.damageDealtDebuff) *
                (attackInfo.targetDamageTakenBuff / attackInfo.targetDamageTakenDebuff); // 减伤增伤易伤等计算

            attackInfo.finalDamage = atk / def * rate * FR;
            //TODO: 计算盾的抵消伤害

            game.addEventProcessor(EventCodes.DAMAGE, attackInfo.sourceId,{attackInfo}); // 造成伤害
            game.addEventProcessor(EventCodes.TAKEN_DAMAGE, attackInfo.targetId, {attackInfo}); // 收到伤害时

            return 5;
        }
        // 伤害结算步骤
        case 5: {
            game.actionUpdateHp(attackInfo.hasParam(AttackParams.IGNORE_SOURCE) ? 0 : attackInfo.sourceId, attackInfo.targetId, -attackInfo.finalDamage);
            return 6;
        }
        // 伤害后步骤
        case 6: {
            if (attackInfo.completedProcessor) {
                game.addProcessor(attackInfo.completedProcessor, { attackInfo, attackInfos}, `AttackCompletedProcessor`);
            } // 伤害后处理，一般处理伤害时的控制
            return -1;
        }
    }
    return 0;
}

export default function attackProcessor(game: Game, {attackInfos}: EventData, step: number): number {
    if (!attackInfos) return 0;
    if (step <= 0) return 0;
    if (step > attackInfos.length) return -1;
    const attackInfo = attackInfos[step - 1];
    game.addProcessor(attackSubProcessor, { attackInfo, attackInfos}, 'AttackSub');
    return step + 1;
}
