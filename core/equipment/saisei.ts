import {Handler, Equipment, EventCodes, EventRange} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        name: '涅槃之火',
        handlers:  [{
            handle(battle: Battle, data: any, step: number) {

            },
            code: EventCodes.NONE, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '涅槃之火处理',
        }],
    }
}

builder.equipmentName = '涅槃之火';