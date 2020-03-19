import {Buff, Entity, Operator, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import {Control} from '../../fixtures/control';

/**
 {
    "index": 134,
    "rank": "N",
    "name": "天邪鬼赤",
    "atk": 2412,
    "hp": 10253.8,
    "def": 396.9,
    "spd": 100,
    "cri": 0,
    "cri_dmg": 1.5,
    "evolve": "-",
    "atk_pt": 90,
    "hp_pt": 90,
    "def_pt": 90,
    "total_pt": 270,
    "name_jp": "天邪鬼赤",
    "name_en": "Red Imp",
    "name_roma": "amanojaku aka",
    "name_kana": "あまのじゃくあか",
    "id": 405
  },
 **/
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
const skill2: Skill = {
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
export default class AmoNoJakuAka extends Entity {
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 405;
    this.name = '天邪鬼赤';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new NormalAttack('肉弹战车'));
    this.addSkill(skill2);
  }

  ai(game: Game, turn: any): boolean {
    /**
     天邪鬼赤
     --技能选择
     使用2技能[挑衅]。
     --目标选择
     1技能[肉弹战车]：随机。
     2技能[挑衅]：随机。
     */
    const enemy = game.getRandomEnemy(this.entityId);
    if (!enemy) return false;

    if (game.actionUseSkill(2, this.entityId, enemy.entityId)) return true;

    return game.actionUseSkill(1, this.entityId, enemy.entityId);
  }
}
