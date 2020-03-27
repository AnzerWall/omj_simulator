import {Handler, Equipment, EventCodes, EventRange, EventData, BattleProperties, Healing} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        no: 17,
        name: '涅槃之火',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {
                const owner = battle.getEntity(data.ownerId)
                const percent  = owner.hp / battle.getComputedProperty(owner.entityId, BattleProperties.MAX_HP);
                if (percent <= 0.3) {
                    battle.actionHeal(Healing.build(data.ownerId, data.ownerId)
                        .shouldComputeCri()
                        .rate(0.15)
                        .end())
                }

            },
            code: EventCodes.ACTION_END, // 触发事件
            range: EventRange.NONE, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '涅槃之火处理',
        }],
    }
}

builder.equipmentName = '涅槃之火';
