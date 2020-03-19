import Game from '../system/game';
import {EventCodes, EventData} from '../fixtures/events';
import {AttackTargetInfo} from '../system/attack';
import {BattleProperties} from '../fixtures/hero-property-names';

export function attackSubProcessor(game: Game, data: EventData, step: number) {
    const { attack, attackTargetInfo: targetInfo} = data;
    if (!targetInfo) return 0;
    if (!attack) return 0;

    const source = game.getEntity(attack.sourceId);
    if (!source) return 0;
    const target = game.getEntity(targetInfo.targetId);
    if (!target) return 0;

    switch (step) {
        // 数据准备
        case 1: {
            targetInfo.critical = source.getComputedProperty(BattleProperties.CRI);
            targetInfo.criticalDamage = source.getComputedProperty(BattleProperties.CRI_DMG);
            targetInfo.damageDealtBuff = source.getComputedProperty(BattleProperties.DMG_DEALT_B) + 1;
            targetInfo.damageDealtDebuff = source.getComputedProperty(BattleProperties.DMG_DEALT_D) + 1;

            targetInfo.targetDamageTakenBuff = target.getComputedProperty(BattleProperties.DMG_TAKEN_B) + 1;
            targetInfo.targetDamageTakenDebuff = target.getComputedProperty(BattleProperties.DMG_TAKEN_D) + 1;
            targetInfo.targetDefence = target.getComputedProperty(BattleProperties.DEF);
            targetInfo.damage = typeof targetInfo.base === 'string' ?
                source.getComputedProperty(targetInfo.base) :
                targetInfo.base(game, attack.sourceId, targetInfo.targetId);
            game.log(`【${source.name}(${source.teamId})】攻击【${target.name}(${target.teamId})】`);
            game.dispatch(EventCodes.BEFORE_ATTACK, {attack, eventId: attack.sourceId}); // 攻击前

            return 2;
        }
        // 受到攻击处理
        case 2: {
            game.dispatch(EventCodes.ATTACK, {attack, eventId: attack.sourceId}); // 攻击时
            game.dispatch(EventCodes.TAKEN_ATTACK, {attack, eventId: targetInfo.targetId}); // 被攻击时

            if (targetInfo.shouldComputeCri) {
                targetInfo.isCri = targetInfo.critical < game.random.real(0, 1) || targetInfo.isCri;
                if (targetInfo.isCri) {
                    return 3
                } else {
                    return 4;
                }
            } else {
                return 4;
            }
        }
        // 暴击处理
        case 3: {
            targetInfo.isCriticalDamage = true;
            game.dispatch(EventCodes.CRI, {attack, eventId: attack.sourceId}); // 暴击时
            return 4;
        }
        // 伤害处理步骤
        case 4: {
            const FR = game.random.real(1 - targetInfo.FR, 1 + targetInfo.FR); // 伤害浮动系数
            const atk = targetInfo.damage * targetInfo.rate * (targetInfo.isCri ? targetInfo.criticalDamage : 1) * 300; // 伤害公式攻击部
            const def = targetInfo.targetDefence + 300; // 伤害公式防御部
            const rate = (targetInfo.damageDealtBuff / targetInfo.damageDealtDebuff) *
                (targetInfo.targetDamageTakenBuff / targetInfo.targetDamageTakenDebuff); // 减伤增伤易伤等计算

            targetInfo.finalDamage = atk / def * rate * FR;
            //TODO: 计算盾的抵消伤害

            game.dispatch(EventCodes.DAMAGE, {attack, eventId: attack.sourceId}); // 造成伤害
            game.dispatch(EventCodes.TAKEN_DAMAGE, {attack, eventId: targetInfo.targetId}); // 收到伤害时


            return 5;
        }
        // 伤害结算步骤
        case 5: {
            game.actionUpdateHp(targetInfo.noSource ? 0 : attack.sourceId, targetInfo.targetId, -targetInfo.finalDamage);
            return 6
        }
        // 伤害后步骤
        case 6: {
            if (targetInfo.onComputed) game.addProcessor(targetInfo.onComputed, { attack, attackTargetInfo: targetInfo }, `AttackSubComputed`); // 伤害后处理，一般处理伤害时的控制
            return -1;
        }
    }
    return 0;
}
export default function attackProcessor(game: Game, { attack }: EventData, step: number): number {
    if (!attack) return 0;
    if (step <= 0) return 0;
    if (step > attack.targetsInfo.length) return -1;
    const info = attack.targetsInfo[step - 1];
    game.addProcessor(attackSubProcessor, { attack, attackTargetInfo: info }, 'AttackSub');
    return step + 1;
}
