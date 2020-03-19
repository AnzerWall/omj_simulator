import {Buff, Entity, Operator, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import {Reasons} from '../../fixtures/reasons';

/**
 {
    "index": 130,
    "rank": "N",
    "name": "涂壁",
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
    "name_jp": "ぬりかべ",
    "name_en": "Nurikabe",
    "name_roma": "nurikabe",
    "name_kana": "ぬりかべ",
    "id": 409
  }
 */
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
    }]

  }
}
const skill2: Skill = {
  no: 2,
  handlers: [],
  name: '坚壁',
  passive: false,
  cost: 2,
  use(game: Game, sourceId: number, selectedId: number): boolean {
    const source = game.getEntity(sourceId);
    if (!source) return false;

    const entities = game.getTeamEntities(source.teamId);
    entities.forEach(e => {
      game.actionAddBuff(sourceId, e.entityId, new KataKabeBuff(sourceId, source.getProperty(BattleProperties.DEF)), Reasons.SKILL);
    });

    return true;
  },
};
export default class NuriKabe extends Entity {
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 409;
    this.name = '涂壁';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new NormalAttack('地震'));
    this.addSkill(skill2);
  }

  ai(game: Game, turn: any): boolean {
    /**
     涂壁
     --技能选择
     使用2技能[坚壁]。
     --目标选择
     1技能[地震]：随机。

     */
    if (game.actionUseSkill(2, this.entityId, this.entityId)) return true;

    const enemy = game.getRandomEnemy(this.entityId);
    if (!enemy) return false;
    return game.actionUseSkill(1, this.entityId, enemy.entityId);
  }
}
