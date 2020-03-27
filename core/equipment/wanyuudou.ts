import {Equipment, EventCodes, EventData, EventRange, Reasons} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        no: 23,
        name: '轮入道',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {
                if (battle.testHit(0.2)) {
                    battle.actionUpdateRunwayPercent(data.ownerId, data.ownerId, 1, Reasons.EQUIPMENT);
                }
            },
            code: EventCodes.NONE, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '轮入道处理',
        }],
    }
}

builder.equipmentName = '轮入道';
