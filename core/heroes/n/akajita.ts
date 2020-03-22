import {
    Attack,
    AttackParams,
    BattleProperties,
    Buff,
    Battle,
    EffectTypes,
    Reasons,
    Skill
} from '../../';
import NormalAttack from '../common/normal-attack';
import BuffSkill from '../common/buff-skill';
import {AttackProcessing} from "../../tasks";
import {SkillTarget} from "../../skill";

export const akajita_skill1 = new NormalAttack('海扁');
export const akajita_skill2 = new BuffSkill(2, '鼓舞', 2, (_, sourceId, targetId) => [
    Buff.build(sourceId,  targetId)
        .name('鼓舞[速]')
        .countDown(2)
        .buff(BattleProperties.SPD, EffectTypes.FIXED, 15)
        .end(),
    Buff.build(sourceId,  targetId)
        .name('鼓舞[暴]')
        .countDown(2)
        .buff(BattleProperties.CRI, EffectTypes.FIXED, 0.11)
        .end()
]);
export const akajita_skill3: Skill = {
    no: 3,
    cost: 3,
    name: '风鼓雷',
    target: SkillTarget.ENEMY,
    use(battle: Battle, sourceId: number, selectedId: number): boolean {
        const selected = battle.getEntity(selectedId);
        const entities = battle.getTeamEntities(selected.teamId);
        function computed(battle: Battle, data: AttackProcessing): number { // 造成伤害时
            const attack = data.attacks[data.index];
            if (!attack) return 0;
            if (battle.testHit(0.3) && attack.targetId) {
                battle.actionUpdateRunwayPercent(sourceId, attack.targetId, -1, Reasons.SKILL);
            }
            return -1;
        }
        for (let i = 0; i < 2; i++) {
            const attacks: Attack[] = entities.map(e => Attack.build(e.entityId, sourceId).rate(0.72).shouldComputeCri().group().completed(computed).end());
            if (!battle.actionAttack(attacks)) return false;

        }
        return true;
    },
};

