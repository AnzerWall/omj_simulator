import {Buff, Entity, Operator, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import {SingleAttack} from '../common/single-attack';
import BuffSkill from '../common/buff-skill';

/**
 * {
    "index": 132,
    "rank": "N",
    "name": "天邪鬼青",
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
    "name_jp": "天邪鬼青",
    "name_en": "Blue Imp",
    "name_roma": "amanojaku ao",
    "name_kana": "あまのじゃくあお",
    "id": 407
  },
 **/
class TeiGinBuff extends Buff {
  constructor(sourceId: number) {
    super(sourceId);
    this.canDispel = true;
    this.canRemove = true;
    this.name = '低吟';
    // TODO: 待确认
    // this.maxCount = 0;    貌似无限制
    this.countDown = 1;
    this.visible = true;

    // 【增益, 状态】 提升40点速度
    this.isAffectProperty = true;
    this.isBuff = true;

    this.effects = [{
      propertyName: BattleProperties.SPD,
      op: Operator.ADD,
      value: 40
    }]

  }
}

export default class AmoNoJakuAo extends Entity {
  static no = 407;
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 407;
    this.name = '天邪鬼青';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new SingleAttack(1, '乱打', 0.33, 0, 3, true));
    this.addSkill(new BuffSkill(2, '低吟', 2, (_, sourceId) => new TeiGinBuff(sourceId)));
  }

  ai(game: Game, turn: any): boolean {
    /**
     天邪鬼青
     --技能选择
     当所有友方单位均无低吟时，使用2技能[低吟]。
     当存在友方单位拥有低吟时，使用1技能[乱打]。
     注：低吟是天邪鬼青提供给队友的buff，提升40速度。
     --目标选择
     1技能[乱打]：随机。
     */
    const entities = game.getTeamEntities(this.teamId);

    if (entities.every(e => !e.hasBuffNamed('低吟'))) {
      if (game.actionUseSkill(2, this.entityId, this.entityId)) return true;
    }

    const enemy = game.getRandomEnemy(this.entityId);
    if (!enemy) return false;
    return game.actionUseSkill(1, this.entityId, enemy.entityId);
  }
}
