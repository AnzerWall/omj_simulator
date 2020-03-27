import {
    Attack,
    AttackParams,
    Battle,
    BattleProperties,
    Buff,
    Control,
    EffectTypes,
    EventCodes,
    EventRange, FakeTurnProcessing,
    Reasons,
    Skill
} from '../../';
import {EventData} from "../../tasks";
import {SkillTarget} from "../../skill";

function fakeTurn(battle: Battle, data: FakeTurnProcessing)  {
    const eventData: EventData = data.data;
    if (data.confusion) { // 被混乱
        const e = battle.getRandomEnemy(data.currentId);
        if (e) {
            battle.actionUseSkill(4, data.currentId, e.entityId, 0);
        }
    } else if (data.onlyAttack) {
        battle.actionUseSkill(4, data.currentId, data.onlyAttack, 0);
    }else {
        battle.actionUseSkill(4, data.currentId, eventData.eventId, 0);
    }
}
export const miketsu_skill1: Skill = {
    no: 1,
    name: '一矢',
    target:  SkillTarget.ENEMY,
    handlers: [
        {
            handle(battle: Battle, data: EventData) {
                if (!data.ownerId || !data.eventId) return 0;
                const p = battle.hasBuffByName(data.ownerId, '狐狩界') ? 0.4 : 0.05; // 结界启动期间提升概率
                const isHit = battle.testHit(p);
                if (isHit) {
                    battle.addFakeTurn(data.ownerId, fakeTurn, data);

                }
                return -1;
            },
            code: EventCodes.ACTION_END, // 监听行动结束事件
            range: EventRange.ENEMY, // 敌方结束
            priority: 0,
            passiveOrEquipment: false,
            name: '一矢判定'
        }
    ],
    cost: 0,
    use(battle: Battle, sourceId: number, selectedId: number) {
        const at = Attack.build(selectedId, sourceId)
            .normal()
            .rate(1)
            .shouldComputeCri()
            .normalAttack()
            .end();
        battle.actionAttack(at);
    },
};
export const miketsu_skill4: Skill = {
    no: 4,
    name: '一矢·封魔',
    cost: 0,
    hide: true,
    target:  SkillTarget.ENEMY,
    use(battle: Battle, sourceId: number, selectedId: number) {
        const source = battle.getEntity(sourceId);
        const at = Attack.build(selectedId, sourceId)
            .normal()
            .rate(1)
            .param(
                AttackParams.SHOULD_COMPUTE_CRI, // 触发暴击
                AttackParams.SINGLE, // 单体
                AttackParams.NORMAL_ATTACK, // 普攻
                AttackParams.NO_TARGET_EQUIPMENT, // 不触发御魂
                AttackParams.NO_TARGET_PASSIVE // 不触发被动
            )
            .end();
        battle.actionAttack(at);

        // 处理附带的四个debuff
        const buff1 = Buff.build(sourceId, selectedId)
            .name('一矢·封魔·沉默', 1) // 同名最多1
            .countDown(1) // 倒计时1
            .control(Control.SILENT) // 沉默
            .probability(1) // 基础概率100%
            .end();
        const buff2 = Buff.build(sourceId, selectedId)
            .name('一矢·封魔·压制', 1)
            .countDown(1)
            .control(Control.EQUIPMENT_FORBID)
            .probability(1)
            .end();
        const buff3 = Buff.build(sourceId, selectedId)
            .name('一矢·封魔·封印', 1)
            .countDown(1)
            .control(Control.PASSIVE_FORBID)
            .probability(1)
            .end();
        const buff4 = Buff.build(sourceId, selectedId)
            .name('一矢·封魔·减疗', 1)
            .countDown(1)
            .probability(1)
            .debuffAP(BattleProperties.HEALING_DOWN, EffectTypes.MAX, 0.7)
            .end();
        battle.actionAddBuff( buff1, Reasons.SKILL);
        battle.actionAddBuff( buff2, Reasons.SKILL);
        battle.actionAddBuff(buff3, Reasons.SKILL);
        battle.actionAddBuff(buff4, Reasons.SKILL);

        // 如果结界开启，增加护符

        if (battle.hasBuffByName(sourceId, '狐狩界')) {
            const buff5 = Buff.build(sourceId, source.teamId - 2)   // 添加全局buff时  -2 表示队伍0   -1 表示队伍1   -3表示双方队伍
                .name('狐狩界·防御', 3) // 最大持有12，实际上是最大持有3，每次增加4张对应处理就好了
                .dependOn(sourceId,'狐狩界') // 依赖于结界的存在
                .buffAP(BattleProperties.DEF, EffectTypes.ADD_RATE,  0.03 * 4)
                .end();

            const buff6 = Buff.build(sourceId, source.teamId - 2)
                .name('狐狩界·伤害', 3)
                .dependOn(sourceId,'狐狩界')
                .buffAP(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED,  0.02 * 4)
                .end();
            const buff7 = Buff.build(sourceId, source.teamId - 2)
                .name('狐狩界·速度', 3)
                .dependOn(sourceId,'狐狩界')
                .buffAP(BattleProperties.SPD, EffectTypes.FIXED,  1 * 4)
                .end();

            battle.actionAddBuff(buff5, Reasons.SKILL);
            battle.actionAddBuff(buff6, Reasons.SKILL);
            battle.actionAddBuff(buff7, Reasons.SKILL);
        }
    },
};

export const miketsu_skill2: Skill = {
    no: 2,
    name: '狐狩界',
    target:  SkillTarget.SELF,
    handlers: [{
        // 先机：释放狐狩界
        handle(battle: Battle, data: EventData) {
            if (!data.ownerId) return 0;
            battle.actionUseSkill(2, data.ownerId, data.ownerId, 0);
            return -1;
        },
        code: EventCodes.SENKI,
        range: EventRange.NONE,
        priority: 0,
        passiveOrEquipment: false,
        name: '【先机】狐狩界'
    }],
    passive: false,
    cost: 3,
    use(battle: Battle, sourceId: number, _: number) {
        const buff = Buff.build(sourceId, sourceId)
            .name('狐狩界', 1) // 同名最多1
            .enchantment() // 是结界
            .countDownBySource(1) // 已来源计算回合
            .end();
        battle.actionAddBuff(buff, Reasons.SKILL); // 开启狐狩界
    },
};
export const miketsu_skill3: Skill = {
    no: 3,
    handlers: [],
    passive: false,
    name: '燃爆·破魔箭',
    cost: 3,
    target:  SkillTarget.ENEMY,
    use(battle: Battle, sourceId: number, selectedId: number) {
        const source = battle.getEntity(sourceId);
        const buffs = battle.filterBuffBySource(source.teamId - 2, sourceId).filter(b => ['狐狩界·防御', '狐狩界·伤害', '狐狩界·速度'].includes(b.name)); // 来源是我的灵符
        const at = Attack.build(selectedId, sourceId)
            .rate( 1.95 * (1 + 0.25 * buffs.length / 3))
            .normal()
            .shouldComputeCri()
            .single()
            .end();
        battle.actionAttack(at);

        // 先攻击后消耗
        buffs.forEach(b => {
           battle.actionRemoveBuff(b, Reasons.COST);
        });

    },
};
