import {AttackInfo, AttackParams, BattleProperties, Buff, EventData, Game, Operator, Reasons, Skill} from '../../';
import NormalAttack from '../common/normal-attack';
import BuffSkill from '../common/buff-skill';

class HageriBuff extends Buff {
    constructor(sourceId: number) {
        super(sourceId);
        this.canDispel = true;
        this.canRemove = true;
        this.name = '鼓舞';
        // TODO: 待确认
        // this.maxCount = 0;    貌似无限制
        this.countDown = 2;
        this.visible = true;

        // 【增益, 状态】 提升15点速度以及11%暴击
        this.isAffectProperty = true;
        this.isBuff = true;

        this.effects = [{
            propertyName: BattleProperties.SPD,
            op: Operator.ADD,
            value: 15
        }, {
            propertyName: BattleProperties.CRI,
            op: Operator.ADD,
            value: 0.11
        }];

    }
}

export const akajita_skill1 = new NormalAttack('海扁');
export const akajita_skill2 = new BuffSkill(2, '鼓舞', 2, (_, sourceId) => new HageriBuff(sourceId));
export const akajita_skill3: Skill = {
    no: 3,
    handlers: [],
    passive: false,
    cost: 3,
    name: '风鼓雷',
    use(game: Game, sourceId: number, selectedId: number): boolean {
        const selected = game.getEntity(selectedId);
        if (!selected) return false;
        const entities = game.getTeamEntities(selected.teamId);

        for (let i = 0; i < 2; i++) {
            const attackInfos: AttackInfo[] = entities.map(e => {
                return new AttackInfo(e.entityId, {
                    rate: 0.72,
                    params: [AttackParams.SHOULD_COMPUTE_CRI, AttackParams.GROUP],
                    completedProcessor:  function (game: Game, data: EventData): void { // 造成伤害时
                        if (game.testHit(0.3) && data.targetId) {
                            game.actionUpdateRunwayPercent(sourceId, data.targetId, -1, Reasons.SKILL);
                        }
                    },
                });
            });
            if (!game.actionAttack(attackInfos)) return false;

        }
        return true;
    },
};

