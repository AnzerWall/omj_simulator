import {AttackInfo, AttackParams, BattleProperties, Battle, Skill} from '../../';
import GroupAttack from '../common/group-attack';

export const houkikami_skill1: Skill = {
    no: 1,
    handlers: [],
    passive: false,
    cost: 0,
    name: '蓄力一攻',
    use(battle: Battle, sourceId: number, selectedId: number): boolean {
        const at = new AttackInfo(selectedId, {
            base:(battle: Battle, sourceId: number, targetId: number): number => {
                const target = battle.getEntity(targetId);
                return battle.getComputedProperty(target.entityId, BattleProperties.ATK);
            },
            limit: (battle: Battle, sourceId: number, _: number): number => {
                const source = battle.getEntity(sourceId);
                return battle.getComputedProperty(source.entityId, BattleProperties.ATK) * 1.5;
            },
            rate: 1,
            params: [ AttackParams.SHOULD_COMPUTE_CRI, AttackParams.NORMAL_ATTACK, AttackParams.SINGLE]
        });
        battle.actionAttack(at);
        return true;
    },
};
export const houkikami_skill2 = new GroupAttack(2, '大扫除', 1.31, 2);
