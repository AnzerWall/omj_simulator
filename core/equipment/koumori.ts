import {Handler, Equipment, EventCodes, EventRange, Buff, BattleProperties, EffectTypes, Reasons} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        name: '蝠翼',
        handlers:  [{
            handle(battle: Battle, data: any, step: number) {
                battle.actionAddBuff(Buff.build(data.skillOwnerId, data.skillOwnerId)
                    .name('蝠翼', 1)
                    .noDispel()
                    .noRemove()
                    .effect(BattleProperties.HP_STEAL, EffectTypes.FIXED, 0.2)
                    .end(), Reasons.EQUIPMENT);
                //TODO: 不触发御魂时处理这个
            },
            code: EventCodes.BATTLE_START, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '蝠翼处理',
        }],
    }
}

builder.equipmentName = '蝠翼';