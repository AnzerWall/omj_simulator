import {
    AttackParams,
    AttackProcessing,
    BattleProperties,
    Buff,
    BuffParams,
    Control,
    EffectTypes,
    Equipment,
    EventCodes,
    EventData,
    EventRange,
    Reasons
} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        no: 14,
        name: '雪幽魂',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {
                const attackProcessing = data.data as AttackProcessing;
                const attack = attackProcessing.attacks[attackProcessing.index];
                if ( !attack) return;

                const buffs = battle.filterBuffByParam(data.ownerId, BuffParams.AFFECT_PROPERTY).filter(b => b.effect && b.effect.propertyName === BattleProperties.SPD && b.effect.value < 0);

                const buff = Buff.build(attack.sourceId, attack.targetId)
                    .countDown(1)
                    .name('冰冻')
                    .control(Control.FROZEN)
                    .probability(buffs.length ? 0.3 : 0.15)
                    .end();
                battle.actionAddBuff(buff, Reasons.EQUIPMENT);
            },
            code: EventCodes.HAS_DAMAGED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '雪幽魂造成伤害处理',
        }, {
            handle(battle: Battle, data: EventData, step: number) {
                const attackProcessing = data.data as AttackProcessing;
                const attack = attackProcessing.attacks[attackProcessing.index];
                if (!attack) return;
                if ( !attack.hasParam(AttackParams.NORMAL) || attack.hasParam(AttackParams.NO_SOURCE_EQUIPMENT) ) return;

                const buff = Buff.build(attack.sourceId, attack.targetId)
                    .countDown(1)
                    .name('减速', 1)
                    .debuffAP(BattleProperties.SPD, EffectTypes.FIXED, -30)
                    .end();
                battle.actionAddBuff(buff, Reasons.EQUIPMENT);
            },
            code: EventCodes.WILL_BE_ATTACKED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '雪幽魂受到攻击处理',
        }],
    }
}

builder.equipmentName = '雪幽魂';
