import {
    AttackParams,
    AttackProcessing,
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
        no: 11,
        name: '荒骷髅',
        handlers:  [{
            handle(battle: Battle, data: EventData, step: number) {
                const attackProcessing = data.data as AttackProcessing;
                const attackInfo = attackProcessing.attackInfos[attackProcessing.index];
                const attack = attackProcessing.attacks[attackProcessing.index];
                if (!attackInfo || !attack) return;
                if ( !attack.hasParam(AttackParams.NORMAL) || attack.hasParam(AttackParams.NO_SOURCE_EQUIPMENT) ) return;

                const buff = battle.filterBuffByName(data.ownerId, '荒骷髅');
                attackInfo.finalDamage = attackInfo.finalDamage * (1 + buff.length ? 0.25: 0.1);
            },
            code: EventCodes.WILL_DAMAGE, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '荒骷髅处理',
        }, {
            handle(battle: Battle, data: any, step: number) {
                battle.actionAddBuff(Buff.build(data.skillOwnerId, data.skillOwnerId)
                    .name('荒骷髅', 1)
                    .countDown(1)
                    .noDispel()
                    .noRemove()
                    .end(), Reasons.EQUIPMENT);
            },
            code: EventCodes.HAS_DAMAGED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority:1000,
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '荒骷髅25%',
        }],
    }
}

builder.equipmentName = '荒骷髅';
