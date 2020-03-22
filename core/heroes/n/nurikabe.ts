import {
    Buff,
    EffectTypes,
    Skill,
    Battle,
    BattleProperties,
    Reasons,
} from '../../';
import NormalAttack from '../common/normal-attack';


export const nurikabes_skill1 = new NormalAttack('地震');
export const nurikabes_skill2: Skill = {
    no: 2,
    name: '坚壁',
    cost: 2,
    use(battle: Battle, sourceId: number, _: number): boolean {
        const source = battle.getEntity(sourceId);

        const entities = battle.getTeamEntities(source.teamId); // 所有队友
        entities.forEach(e => {
            const buff = Buff.build(sourceId, e.entityId)
                .name('坚壁', 1)
                .countDown(2)
                .buff(BattleProperties.DEF, EffectTypes.FIXED, 0.2 * source.getProperty(BattleProperties.DEF) + 0.4 * e.getProperty(BattleProperties.DEF))
                .end();

            battle.actionAddBuff(buff, Reasons.SKILL);
        });

        return true;
    },
};
