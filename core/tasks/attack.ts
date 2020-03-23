import {Battle, Attack, BattleProperties, EventCodes, AttackParams, eps} from "../";
export class AttackProcessing {
    index: number = 0;
    attackInfos: AttackInfo[] = [];
    attacks: Attack[] = [];
}


export class AttackInfo {
    FR: number = 0; // 波动值

    // 处理攻击的中间信息，修改影响结果
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

    remainHp: number = 0;
    isDead: boolean = false;
    originHp: number = 0;
}




export default function attackProcessor(battle: Battle, data: AttackProcessing, step: number): number {
    const attack =  data.attacks[data.index];
    if (!attack) return 0;

    const source = battle.getEntity(attack.sourceId);
    const target = battle.getEntity(attack.targetId);

    switch (step) {
        case 1: {
            return 2;
        }
        // 数据准备
        case 2: {
            const attackInfo = data.attackInfos[data.index] = new AttackInfo();
            attackInfo.critical = battle.getComputedProperty(source.entityId, BattleProperties.CRI);
            attackInfo.criticalDamage = battle.getComputedProperty(source.entityId, BattleProperties.CRI_DMG);
            attackInfo.damageDealtBuff = battle.getComputedProperty(source.entityId, BattleProperties.DMG_DEALT_B) + 1;
            attackInfo.damageDealtDebuff = battle.getComputedProperty(source.entityId, BattleProperties.DMG_DEALT_D) + 1;

            attackInfo.targetDamageTakenBuff = battle.getComputedProperty(target.entityId, BattleProperties.DMG_TAKEN_B) + 1;
            attackInfo.targetDamageTakenDebuff = battle.getComputedProperty(target.entityId, BattleProperties.DMG_TAKEN_D) + 1;
            attackInfo.targetDefence = battle.getComputedProperty(target.entityId, BattleProperties.DEF);
            attackInfo.damage = typeof attack.base === 'string' ?
                battle.getComputedProperty(source.entityId, attack.base) :
                attack.base(battle, attack.sourceId, attack.targetId);

            battle.log(`【${source.name}(${source.teamId})】攻击【${target.name}(${target.teamId})】`);
            battle.addEventProcessor(EventCodes.BEFORE_ATTACK, attack.sourceId, data); // 攻击前

            return 3;
        }
        // 受到攻击处理
        case 3: {
            if (!attack.hasParam(AttackParams.IGNORE_SOURCE)) battle.addEventProcessor(EventCodes.WILL_ATTACK,  attack.sourceId, data); // 攻击时
            battle.addEventProcessor(EventCodes.WILL_BE_ATTACKED, attack.targetId, data); // 被攻击时
            return 4;
        }
        case 4:{
            const attackInfo = data.attackInfos[data.index];
            if (!attackInfo) return 0;
            if (attack.hasParam(AttackParams.SHOULD_COMPUTE_CRI)) {
                if (attack.hasParam(AttackParams.INDIRECT) && battle.getComputedProperty(target.entityId, BattleProperties.DEF) <= eps) { // 间接伤害 防御为0时必然暴击
                    attackInfo.isCri = true;
                } else {
                    attackInfo.isCri = attackInfo.isCri || battle.testHit(attackInfo.criticalDamage);
                }
                if (attackInfo.isCri) {
                    attack.addParam(AttackParams.CRITICAL);
                    battle.addEventProcessor(EventCodes.CRI, attack.sourceId, data ); // 暴击时
                }
            }
            return 5;
        }
        // 伤害处理步骤
        case 5: {
            const attackInfo = data.attackInfos[data.index];
            if (!attackInfo) return 0;
            const FR = battle.random.real(1 - attackInfo.FR, 1 + attackInfo.FR); // 伤害浮动系数
            const atk = attackInfo.damage * attack.rate * (attackInfo.isCri ? attackInfo.criticalDamage : 1) * 300; // 伤害公式攻击部
            const def = attackInfo.targetDefence + 300; // 伤害公式防御部
            const rate = (attackInfo.damageDealtBuff / attackInfo.damageDealtDebuff) *
                (attackInfo.targetDamageTakenBuff / attackInfo.targetDamageTakenDebuff); // 减伤增伤易伤等计算

            attackInfo.finalDamage = atk / def * rate * FR;
            //TODO: 计算盾的抵消伤害

            attackInfo.originHp = attackInfo.remainHp = target.hp; // 保存剩余生命

            if (attackInfo.finalDamage > eps) {
                attackInfo.remainHp = Math.max(target.hp - attackInfo.finalDamage, 0);
                attackInfo.isDead = attackInfo.remainHp <= eps;
                if (!attack.hasParam(AttackParams.IGNORE_SOURCE)) battle.addEventProcessor(EventCodes.WILL_DAMAGE, attack.sourceId,data); // 造成伤害前
                battle.addEventProcessor(EventCodes.WILL_BE_DAMAGE, attack.targetId, data); // 收到伤害时前
                return 6;
            }
            return 7;
        }
        case 6: {
            const attackInfo = data.attackInfos[data.index];
            if (!attackInfo) return 0;
            
            target.hp = attackInfo.remainHp;
            target.dead = attackInfo.isDead;
            battle.log(`${source ? `【${source.name}(${source.teamId})】` : ''}对【${target.name}(${target.teamId})】造成${attackInfo.finalDamage}点血， 剩余${attackInfo.remainHp}`, attackInfo.isDead ? '【死亡】' : '');
       
            if (attackInfo.isDead) {
                const field = battle.fields[target.teamId];
                if (field) {
                    const index = field.indexOf(target.entityId);
                    if (index !== -1) {
                        field[index] = 0;
                    }
                }
                battle.runway.freeze(target.entityId);
                // TODO: 杀生丸禁止复活buff
                battle.buffs = battle.buffs.filter(b => b.ownerId === target.entityId); // 移除所有buff
            }
            if (!attack.hasParam(AttackParams.IGNORE_SOURCE)) battle.addEventProcessor(EventCodes.HAS_DAMAGED, attack.sourceId,data); // 造成伤害后
            battle.addEventProcessor(EventCodes.HAS_BEEN_DAMAGED, attack.targetId, data); // 收到伤害后
            battle.addEventProcessor(EventCodes.UPDATE_HP, attack.targetId, data); // 更新hp

            if (attackInfo.isDead) {
                battle.addEventProcessor(EventCodes.DEAD, attack.targetId, data); // 死亡
            }
            return 7;
        }
        // 伤害后步骤
        case 7: {
            if (attack.completedProcessor) {
                battle.addProcessor(attack.completedProcessor, data, `AttackCompletedProcessor`);
            } // 伤害后处理，一般处理伤害时的控制
            if (!attack.hasParam(AttackParams.IGNORE_SOURCE)) battle.addEventProcessor(EventCodes.HAS_ATTACKED, attack.sourceId,data);
            battle.addEventProcessor(EventCodes.HAS_BEEN_ATTACKED, attack.targetId, data);
            return 8;
        }
        case 8: {
            if (data.index + 1 >= data.attackInfos.length) return -1;
            data.index ++;
            return 2;
        }
    }
    return 0;
}
