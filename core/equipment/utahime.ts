import {
    Handler,
    Equipment,
    EventCodes,
    EventRange,
    EventData,
    AttackProcessing,
    AttackParams,
    Attack,
    BattleProperties
} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        no: 40,
        name: '鬼灵歌姬',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {
                const isHit = battle.testHit(0.4);
                if (!isHit) return;
                const attackProcessing = data.data as AttackProcessing;
                const attackInfo = attackProcessing.attackInfos[attackProcessing.index];
                const attack = attackProcessing.attacks[attackProcessing.index];
                if (!attackInfo || !attack) return;
                if (attack.hasParam(AttackParams.NO_SOURCE_EQUIPMENT) || attack.hasTag('鬼灵歌姬') ) return;

                const source = battle.getEntity(attack.sourceId);
                const count = source.getBattleData('鬼灵歌姬攻击计数') as number || 0;
                if (count % 6 == 0) {
                    const newAttack = Attack.build(data.ownerId, attack.targetId)
                        .real()
                        .rate(1)
                        .base((battle: Battle, sourceId: number, targetId: number) => {
                            const targetMaxHp = battle.getComputedProperty(attack.targetId, BattleProperties.MAX_HP);
                            const sourceAtk = battle.getComputedProperty(attack.targetId, BattleProperties.ATK); //target.getProperty(BattleProperties.ATK);

                            return Math.min(targetMaxHp * 0.2, sourceAtk * 2.25);
                        })
                        .tag('鬼灵歌姬')
                        .end();
                    attackProcessing.attacks.splice(attackProcessing.index + 1, 0, newAttack)
                }

                source.setTurnData('鬼灵歌姬攻击计数', count + 1);
            },
            code: EventCodes.HAS_DAMAGED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1001,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '鬼灵歌姬处理',
        }],
    }
}

builder.equipmentName = '鬼灵歌姬';
