import {
    Buff,
    Operator,
    Skill,
    Game,
    BattleProperties,
    Control
} from '../../';
import NormalAttack from '../common/normal-attack';

class AmanojakuakaProvokeBuff extends Buff {
    constructor(sourceId: number) {
        super(sourceId);
        this.canDispel = false;
        this.canRemove = true;
        this.name = '挑衅';
        // TODO: 不确定
        this.maxCount = 1;
        this.countDown = 1;
        this.visible = true;
        // 对其挑衅
        this.control = Control.PROVOKE;
        // 提升20伤害
        this.effects.push({
            propertyName: BattleProperties.DMG_DEALT_B,
            op: Operator.ADD,
            value: 0.2
        });
        // 提升40易伤
        this.effects.push({
            propertyName: BattleProperties.DMG_TAKEN_D,
            op: Operator.ADD,
            value: 0.4
        });
    }
}

export const amonojakuaka_skill1 = new NormalAttack('肉弹战车');
export const amonojakuaka_skill2: Skill = {
    no: 2,
    name: '挑衅',
    handlers: [],
    passive: false,
    cost: 2,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        game.actionAddBuffP(sourceId, selectedId, new AmanojakuakaProvokeBuff(sourceId), 1);
        return true;
    },
};
