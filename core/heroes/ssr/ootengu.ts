import {
    BattleProperties,
    Buff,
    EffectTypes,
    EventCodes,
    EventRange,
    Battle,
    Reasons,
    Skill, RealEventData, AddBuffProcessing
} from '../../index';
import NormalAttack from '../common/normal-attack';
import GroupAttack from '../common/group-attack';

export const ootengu_skill1: Skill = new NormalAttack('风袭');

function buildBuff1(s: number, t: number): Buff {
    return Buff.build(s, t)
        .name('庇护', 1)
        .stamp()
        .end()
}
function buildBuff2(s: number, t: number): Buff {
    return Buff.build(s, t)
        .name('雄姿英发', 80) // 蛇精病
        .stamp()
        .effect(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED , 0.01)
        .end()
}
export const ootengu_skill2: Skill = {
    no: 2,
    name: '钢铁之羽',
    passive: true,
    cost: 0,
    handlers: [{
        // 战斗开始：获得庇护
        handle(battle: Battle, data: RealEventData) {
            if (data.skillOwnerId) {
                battle.actionAddBuff(buildBuff1(data.skillOwnerId, data.skillOwnerId), Reasons.SKILL);
            }
        },
        code: EventCodes.BATTLE_START,
        range: EventRange.NONE,
        priority: 0,
        passive: true,
    }, {
        // 回合结束：获得庇护
        handle(battle: Battle, data: RealEventData) {
            if (data.skillOwnerId) {
                battle.actionAddBuff(buildBuff1(data.skillOwnerId, data.skillOwnerId), Reasons.SKILL);
            }
        },
        code: EventCodes.TURN_END,
        range: EventRange.SELF,
        priority: 0,
        passive: true,
    }, {
        // 回合开始：失去庇护
        handle(battle: Battle, data: RealEventData) {
            if (data.skillOwnerId) {
                const buffs = battle.filterBuffByName(data.skillOwnerId, '庇护');
                buffs.forEach(b => {
                    battle.actionRemoveBuff(b, Reasons.SKILL);
                })
            }
        },
        code: EventCodes.TURN_START,
        range: EventRange.SELF,
        priority: 0,
        passive: false,
    }, {
        // 庇护效果处理
        handle(battle: Battle, data: RealEventData) {
            if (data.skillOwnerId && data.data) {
                const buffs = battle.filterBuffByName(data.skillOwnerId, '庇护');
                if (buffs.length) {
                    ( data.data as AddBuffProcessing).cancel = true; // 抵消
                    buffs.forEach(b => {
                        battle.actionRemoveBuff(b, Reasons.SKILL);
                    })
                }
            }
        },
        code: EventCodes.BEFORE_BUFF_GET,
        range: EventRange.SELF,
        priority: 0,
        passive: false,
    },{
        // 造成伤害时: 获得雄姿英发
        handle(battle: Battle, data: RealEventData) {
            if(battle.testHit(0.5) && data.skillOwnerId) {
                battle.actionAddBuff(buildBuff2(data.skillOwnerId, data.skillOwnerId), Reasons.SKILL);
            }
        },
        code: EventCodes.DAMAGE,
        range: EventRange.SELF,
        priority: 0,
        passive: true,
    }]
};
export const ootengu_skill3: Skill = new GroupAttack(3,'羽刃暴风', 0.45, 3, 4);
