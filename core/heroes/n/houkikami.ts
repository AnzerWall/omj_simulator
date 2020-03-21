import {AttackInfo, AttackParams, BattleProperties, Game, Skill} from '../../';
import GroupAttack from '../common/group-attack';

export const houkikami_skill1: Skill = {
    no: 1,
    handlers: [],
    passive: false,
    cost: 0,
    name: '蓄力一攻',
    use(game: Game, sourceId: number, selectedId: number): boolean {
        const at = new AttackInfo(selectedId, {
            base:(game: Game, sourceId: number, targetId: number): number => {
                const target = game.getEntity(targetId);
                return game.getComputedProperty(target.entityId, BattleProperties.ATK);
            },
            limit: (game: Game, sourceId: number, _: number): number => {
                const source = game.getEntity(sourceId);
                return game.getComputedProperty(source.entityId, BattleProperties.ATK) * 1.5;
            },
            rate: 1,
            params: [ AttackParams.SHOULD_COMPUTE_CRI, AttackParams.NORMAL_ATTACK, AttackParams.SINGLE]
        });
        game.actionAttack(at);
        return true;
    },
};
export const houkikami_skill2 = new GroupAttack(2, '大扫除', 1.31, 2);
