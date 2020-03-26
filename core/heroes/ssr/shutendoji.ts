import { AddBuffProcessing } from './../../tasks/add-buff';
import {
    Skill,
    Buff,
    EventCodes,
    EventRange,
    Battle,
    EventData,
    Reasons,
    EffectTypes,
    BattleProperties,
    Attack,
    Healing,
} from '../../';
import {SkillTarget} from "../../skill";
function buildKyoki(s: number, t: number): Buff {
    return Buff.build(s, t)
        .name('狂气', 4)
        .buff() // 增益
        .end()
}

export const shutendoji_skill1: Skill = {
    no: 1,
    name: '鬼葫芦',
    cost: 0,
    target:  SkillTarget.ENEMY,
    use: (battle: Battle, sourceId: number, selectedId: number) => {
        const buffs = battle.filterBuffByName(sourceId, '狂气');
        const selected = battle.getEntity(selectedId);

        for (let i = 0; i < (1 + buffs.length /* 增加鬼葫芦次数的普攻 */); i++) {
            battle.actionAttack(Attack.build(selectedId, sourceId).rate(1.25).normal().shouldComputeCri().normalAttack().end());
        }
    }
}


export const shutendoji_skill2: Skill = {
    no: 2,
    name: '狂气',
    cost: 0,
    passive: true,
    handlers: [
        // 回合结束 50% 获得狂气
        {
            handle: (battle: Battle, data: any, step: number) => {
                if (data.skillOwnerId) {
                    const buffs = battle.filterBuffByName(data.skillOwnerId, '狂气');
                    if (buffs.length >= 4) return; // 写了不覆盖
                    const isHit = battle.testHit(0.5);
                    if (isHit) {
                        battle.actionAddBuff(buildKyoki(data.skillOwnerId, data.skillOwnerId), Reasons.SKILL)
                    }

                }
            }, // 执行
            code: EventCodes.TURN_END, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority: 0, // 优先级
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '回合结束获得狂气',
        },
        // 受到攻击 25% 获得狂气
        {
            handle: (battle: Battle, data: EventData, step: number) =>{
                if (data.skillOwnerId) {
                    const buffs = battle.filterBuffByName(data.skillOwnerId, '狂气');
                    if (buffs.length >= 4) return; // 写了不覆盖
                    const isHit = battle.testHit(0.25);
                    if (isHit) {
                        battle.actionAddBuff(buildKyoki(data.skillOwnerId, data.skillOwnerId), Reasons.SKILL)
                    }

                }
            }, // 执行
            code: EventCodes.HAS_BEEN_ATTACKED, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority: 0, // 优先级
            passiveOrEquipment: true, // 是否是写在被动里的
            name: '受到攻击获得狂气',
        },
    ]

}

export const shutendoji_skill3: Skill = {
    no: 3,
    name: '狂啸',
    cost: 3,
    handlers: [
        {
            handle: (battle: Battle, data: EventData, step: number) =>{
               const processing = data.data as AddBuffProcessing;
               const buff = processing.buff;
               if (buff.name === '鬼王降临') { // 形态结束时失去所有狂气
                const buffs = battle.filterBuffByName(buff.ownerId, '狂气');
                buffs.forEach(b => {
                    battle.actionRemoveBuff(b, Reasons.COST);
                });
               }

            }, // 执行
            code: EventCodes.BUFF_REMOVE, // 触发事件
            range: EventRange.SELF, // 事件范围
            priority: 0, // 优先级
            passiveOrEquipment: false, // 是否是写在被动里的
            name: '鬼王降临形态结束处理',
        }
    ],
    target: (battle: Battle, entityId: number): number[] =>{
        const buffs = battle.filterBuffByName(entityId, '狂气');
        if (!buffs.length) return [];
        return [entityId];
    },
    use: (battle: Battle, sourceId: number, selectedId: number) => {
        const buffs = battle.filterBuffByName(sourceId, '狂气');
        if (!buffs.length) return;
        battle.actionHeal(Healing.build(sourceId, sourceId).rate(0.3).shouldComputeCri().end());
        battle.actionUpdateRunwayPercent(sourceId, sourceId, 0.5, Reasons.SKILL)
        battle.actionAddBuff(Buff.build(sourceId, selectedId)
            .name('鬼王降临', 1)
            .stamp()
            .ruleControlImmune() // 免疫控制
            .effect(BattleProperties.HP_STEAL, EffectTypes.FIXED, 0.1) // 附带10%吸血
            .countDownBySource(buffs.length) // 持续狂气层数
            .end()
        )
    }
}
