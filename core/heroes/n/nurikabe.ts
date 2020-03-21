import {
    Buff,
    EffectTypes,
    Skill,
    Game,
    BattleProperties,
    Reasons,
} from '../../';
import NormalAttack from '../common/normal-attack';


export const nurikabes_skill1 = new NormalAttack('地震');
export const nurikabes_skill2: Skill = {
    no: 2,
    name: '坚壁',
    cost: 2,
    use(game: Game, sourceId: number, _: number): boolean {
        const source = game.getEntity(sourceId);
        if (!source) return false;

        const entities = game.getTeamEntities(source.teamId); // 所有队友
        entities.forEach(e => {
            const buff = Buff.build(sourceId)
                .name('坚壁', 1)
                .countDown(2)
                .buff(BattleProperties.DEF, EffectTypes.FIXED, 0.2 * source.getProperty(BattleProperties.DEF) + 0.4 * e.getProperty(BattleProperties.DEF))
                .end();

            game.actionAddBuff(e.entityId, buff, Reasons.SKILL);
        });

        return true;
    },
};
