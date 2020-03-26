import {
    Attack,
    AttackParams,
    AttackProcessing,
    BattleProperties,
    Equipment,
    EventCodes,
    EventData,
    EventRange
} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        name: '针女',
        handlers: [{
            handle(battle: Battle, data: EventData, step: number) {
                const isHit = battle.testHit(0.4);
                if (!isHit) return;
                const attackProcessing = data.data as AttackProcessing;
                const attackInfo = attackProcessing.attackInfos[attackProcessing.index];
                const attack = attackProcessing.attacks[attackProcessing.index];
                if (!attackInfo || !attack) return;
                if (!attack.hasParam(AttackParams.CRITICAL) || !attack.hasParam(AttackParams.NORMAL) || attack.hasParam(AttackParams.NO_SOURCE_EQUIPMENT) ) return; // 不是暴击伤害返回


                const newAttack = Attack.build(data.skillOwnerId, attack.targetId)
                    .real()
                    .rate(1)
                    .base((battle: Battle, sourceId: number, targetId: number) => {
                        const targetMaxHp = battle.getComputedProperty(attack.targetId, BattleProperties.MAX_HP);
                        const sourceAtk = battle.getComputedProperty(attack.targetId, BattleProperties.ATK); //target.getProperty(BattleProperties.ATK);

                        return Math.min(targetMaxHp * 0.1, sourceAtk * 1.2);
                    })
                    .end();

                attackProcessing.attacks.splice(attackProcessing.index + 1, 0, newAttack)
            },
            code: EventCodes.HAS_DAMAGED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '针女处理',
        }],
    }
}


builder.equipmentName = '针女';