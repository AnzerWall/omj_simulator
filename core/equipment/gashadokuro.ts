import {
    BattleProperties,
    Buff,
    EffectTypes,
    Equipment,
    EventCodes,
    EventData,
    EventRange,
    Reasons,
    RemoveBuffProcessing
} from "../index";
import Battle from "../battle";


export default function builder(): Equipment {
    return {
        name: '荒骷髅',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {

                battle.actionAddBuff(Buff.build(data.skillOwnerId, data.skillOwnerId)
                    .name('荒骷髅', 1)
                    .noDispel()
                    .noRemove()
                    .effect(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED, 0.1)
                    .end(), Reasons.EQUIPMENT);

            },
            code: EventCodes.SUNMON, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '荒骷髅10%-1',
        }, {
            handle(battle: Battle, data: any, step: number) {
                battle.actionAddBuff(Buff.build(data.skillOwnerId, data.skillOwnerId)
                    .name('荒骷髅', 1)
                    .countDown(1)
                    .noDispel()
                    .noRemove()
                    .effect(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED, 0.25)
                    .end(), Reasons.EQUIPMENT);
            },
            code: EventCodes.HAS_DAMAGED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '荒骷髅25%',
        }, {
            handle(battle: Battle, data: EventData, step: number) {
                const removeBuffProcessing = data.data as RemoveBuffProcessing;
                if (removeBuffProcessing.buff.name === '荒骷髅') {
                    battle.actionAddBuff(Buff.build(data.skillOwnerId, data.skillOwnerId)
                        .name('荒骷髅', 1)
                        .noDispel()
                        .noRemove()
                        .effect(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED, 0.1)
                        .end(), Reasons.EQUIPMENT);
                }
            },
            code: EventCodes.BUFF_REMOVE, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '荒骷髅10%-2',
        }],
    }
}

builder.equipmentName = '荒骷髅';