import {BattleProperties, Buff, EffectTypes, Equipment, EventCodes, EventData, EventRange} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        no: 12,
        name: '地震鲶',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {
                battle.actionAddBuff(Buff.build(data.ownerId, data.ownerId).effect(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED, 0.6).name('地震鲶减伤', 1).end())
            },
            code: EventCodes.BATTLE_START, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '地震鲶处理',
        }, {
            handle(battle: Battle, data: EventData, step: number) {
                // 单次攻击内触发一次~
            },
            code: EventCodes.BATTLE_START, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '地震鲶处理',
        }],
    }
}

builder.equipmentName = '地震鲶';
