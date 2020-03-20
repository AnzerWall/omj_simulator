import {Skill, Game, BattleProperties, AttackTargetInfo, Attack} from '../../';
import GroupAttack from '../common/group-attack';

export const houkikami_skill1: Skill = {
    no: 1,
    handlers: [],
    passive: false,
    cost: 0,
    name: '蓄力一攻',
    use(game: Game, sourceId: number, selectedId: number): boolean {
        const at = new AttackTargetInfo(selectedId);
        at.base = (game: Game, sourceId: number, targetId: number): number => {
            const target = game.getEntity(targetId);
            if (!target) return 0;
            return target.getComputedProperty(BattleProperties.ATK);
        };
        at.limit = (game: Game, sourceId: number, _: number): number => {
            const source = game.getEntity(sourceId);
            if (!source) return 0;
            return source.getComputedProperty(BattleProperties.ATK) * 1.5;
        };
        at.rate = 1;
        at.shouldComputeCri = true;
        at.isSingleDamage = true;
        at.isNormalAttack = true;

        const attack: Attack = {
            sourceId: sourceId,
            targetsInfo: [at],
        };
        return game.actionAttack(attack);
    },
};
export const houkikami_skill2 = new GroupAttack(2, '大扫除', 1.31, 2);
