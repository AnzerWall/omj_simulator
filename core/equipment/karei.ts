import {Equipment, EventCodes, EventRange, EventData, Reasons} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        name: '火灵',
        handlers:  [{
            handle(battle: Battle, data: EventData, _step: number) {
                const owner = battle.getEntity(data.skillOwnerId);
                battle.actionUpdateMana(data.skillOwnerId, owner.teamId, 3, Reasons.EQUIPMENT)
            },
            code: EventCodes.BATTLE_START, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:0,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '火灵处理',
        }],
    }
}

builder.equipmentName = '火灵';