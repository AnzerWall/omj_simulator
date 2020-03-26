import {
    Handler,
    Equipment,
    EventCodes,
    EventRange,
    EventData,
    AttackProcessing,
    BattleProperties,
    AttackParams
} from "../index";
import Battle from "../battle";

export default function builder(): Equipment {
    return {
        name: '狂骨',
        handlers:  [{
            handle(battle: Battle, data: EventData, _step: number) {
                const attackProcessing = data.data as AttackProcessing;
                const attackInfo = attackProcessing.attackInfos[attackProcessing.index];
                const attack = attackProcessing.attacks[attackProcessing.index];

                if (!attackInfo) return;
                if ( !attack.hasParam(AttackParams.NORMAL) || attack.hasParam(AttackParams.NO_SOURCE_EQUIPMENT) ) return;
                const owner = battle.getEntity(data.skillOwnerId);
                const mana = battle.getMana(owner.teamId);
                if (mana.num > 0) {
                    attackInfo.finalDamage = attackInfo.finalDamage * (1 + 0.08 * mana.num);
                }
            },
            code: EventCodes.WILL_DAMAGE, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '狂骨处理',
        }],
    }
}

builder.equipmentName = '狂骨';