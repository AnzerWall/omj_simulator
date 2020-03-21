import {
    AttackInfo,
    AttackParams,
    BattleProperties,
    Buff,
    Control,
    EffectTypes,
    EventCodes,
    EventData,
    EventRange,
    Game,
    Reasons,
    Skill
} from '../../';

export const skill1: Skill = {
    no: 1,
    name: '一矢',
    handlers: [
        {
            handle(game: Game, data: EventData) {
                if (!data.skillOwnerId || !data.targetId) return 0;
                const owner = game.getEntity(data.skillOwnerId);
                const p = owner.hasBuffNamed('狐狩界') ? 0.4 : 0.05;
                const isHit = game.testHit(p);
                if (isHit) {
                    game.actionUseSkill(4, data.skillOwnerId, data.targetId); // TODO: 混乱时随机普攻
                }
            },
            code: EventCodes.ACTION_END,
            range: EventRange.ENEMY,
            priority: 0,
            passive: false,
        }
    ],
    cost: 0,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        const at = new AttackInfo(selectedId, {
            sourceId,
            rate: 100,
            params: [AttackParams.SHOULD_COMPUTE_CRI, AttackParams.SINGLE, AttackParams.NORMAL_ATTACK],
        });
        game.actionAttack(at);
        return true;
    },
};
export const skill4: Skill = {
    no: 4,
    name: '一矢·封魔',
    cost: 0,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        const owner = game.getEntity(sourceId);
        const at = new AttackInfo(selectedId, {
            sourceId,
            rate: 100,
            params: [AttackParams.SHOULD_COMPUTE_CRI,
                AttackParams.SINGLE,
                AttackParams.NORMAL_ATTACK,
                AttackParams.NO_TARGET_EQUIPMENT, // 不触发御魂
                AttackParams.NO_TARGET_PASSIVE // 不触发被动
            ],
        });
        game.actionAttack(at);
        const buff1 = Buff.build(sourceId)
            .name('一矢·封魔·沉默', 1)
            .countDown(1)
            .control(Control.SILENT)
            .probability(1)
            .end();
        const buff2 = Buff.build(sourceId)
            .name('一矢·封魔·压制', 1)
            .countDown(1)
            .control(Control.EQUIPMENT_FORBID)
            .probability(1)
            .end();
        const buff3 = Buff.build(sourceId)
            .name('一矢·封魔·封印', 1)
            .countDown(1)
            .control(Control.PASSIVE_FORBID)
            .probability(1)
            .end();
        const buff4 = Buff.build(sourceId)
            .name('一矢·封魔·减疗', 1)
            .countDown(1)
            .probability(1)
            .debuff(BattleProperties.HEALING_DOWN, EffectTypes.MAX, 0.7)
            .end();
        game.actionAddBuff(selectedId, buff1, Reasons.SKILL);
        game.actionAddBuff(selectedId, buff2, Reasons.SKILL);
        game.actionAddBuff(selectedId, buff3, Reasons.SKILL);
        game.actionAddBuff(selectedId, buff4, Reasons.SKILL);

        const kojukai = owner.getBuffNamed('狐狩界');

        if (kojukai) {
            const buff5 = Buff.build(sourceId)
                .name('狐狩界·防御', 3)
                .dependOn(kojukai.buffId)
                .buff(BattleProperties.DEF, EffectTypes.ADD_RATE,  0.03 * 4)
                .end();

            const buff6 = Buff.build(sourceId)
                .name('狐狩界·伤害', 3)
                .dependOn(kojukai.buffId)
                .buff(BattleProperties.DMG_DEALT_B, EffectTypes.FIXED,  0.02 * 4)
                .end();
            const buff7 = Buff.build(sourceId)
                .name('狐狩界·速度', 3)
                .dependOn(kojukai.buffId)
                .buff(BattleProperties.SPD, EffectTypes.FIXED,  1 * 4)
                .end();

            game.actionAddBuff(-1, buff5, Reasons.SKILL);
            game.actionAddBuff(-1, buff6, Reasons.SKILL);
            game.actionAddBuff(-1, buff7, Reasons.SKILL);
        }
        return true;
    },
};

export const skill2: Skill = {
    no: 2,
    name: '狐狩界',
    handlers: [{
        // 先机：释放狐狩界
        handle(game: Game, data: EventData) {
            if (!data.skillOwnerId) return 0;
            game.actionUseSkill(2, data.skillOwnerId, data.skillOwnerId);
            return -1;
        },
        code: EventCodes.SENKI,
        range: EventRange.NONE,
        priority: 0,
        passive: false,
    }],
    passive: false,
    cost: 3,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        const buff = Buff.build(sourceId)
            .name('狐狩界', 1)
            .enchantment()
            .countDownBySource(1)
            .end();
        game.actionAddBuff(sourceId, buff, Reasons.SKILL);
        return true;
    },
};
export const skill3: Skill = {
    no: 3,
    handlers: [],
    passive: false,
    name: '燃爆·破魔箭',
    cost: 3,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        return true;
    },
};
