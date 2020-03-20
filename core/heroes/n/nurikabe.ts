import {
    Buff,
    Operator,
    Skill,
    Game,
    BattleProperties,
    Reasons,
} from '../../';
import NormalAttack from '../common/normal-attack';

class KataKabeBuff extends Buff {
    constructor(sourceId: number, def: number) {
        super(sourceId);
        this.canDispel = true;
        this.canRemove = true;
        this.name = '坚壁';
        this.maxCount = 1;
        this.countDown = 2;
        this.visible = true;

        // 【增益, 状态】 提升40%防御 再加上涂壁20%的初始防御
        this.isAffectProperty = true;
        this.isBuff = true;

        this.effects = [{
            propertyName: BattleProperties.DEF,
            op: Operator.RATE,
            value: 0.4
        }, {
            propertyName: BattleProperties.DEF,
            op: Operator.ADD,
            value: def * 0.2
        }];

    }
}

const skill2: Skill = {
    no: 2,
    handlers: [],
    name: '坚壁',
    passive: false,
    cost: 2,
    use(game: Game, sourceId: number, _: number): boolean {
        const source = game.getEntity(sourceId);
        if (!source) return false;

        const entities = game.getTeamEntities(source.teamId);
        entities.forEach(e => {
            game.actionAddBuff(sourceId, e.entityId, new KataKabeBuff(sourceId, source.getProperty(BattleProperties.DEF)), Reasons.SKILL);
        });

        return true;
    },
};
export const nurikabes_skill1 = new NormalAttack('地震');
export const nurikabes_skill2 = skill2;
