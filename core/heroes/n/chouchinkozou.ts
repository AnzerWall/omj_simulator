import {Entity, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import Attack, {AttackTargetInfo} from '../../system/attack';
import {GroupAttack} from '../common/group-attack';

/**
 *  {
    "index": 140,
    "rank": "N",
    "name": "提灯小僧",
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
    "name_jp": "提灯小僧",
    "name_en": "Lantern Boy",
    "name_roma": "chouchin kozou",
    "name_kana": "ちょうちんこぞう",
    "id": 245
  }
 */

export default class ChouChinKoZou extends Entity {
  static no = 245;
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 245;
    this.name = '提灯小僧';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new NormalAttack());
    this.addSkill(new GroupAttack(2, '鬼火球', 1.29, 2 ))

  }
  ai(game: Game, turn: any): boolean {
    /**
     提灯小僧
     --技能选择
     使用3技能[鬼火球]。
     --目标选择
     1技能[头槌]：当敌方有生命比例在20%以下的单位时，优先选择其中生命比例最低的单位为目标。
     */

    const enemy = game.getRandomEnemy(this.entityId);
    if (!enemy) return false;
    if (game.actionUseSkill(2, this.entityId, enemy.entityId)) return true;

    const entities = game.getEnemies(this.teamId).sort((a, b) =>  a.hp - b.hp);
    const enemy2 = entities[0];
    if (!enemy2) return false;

    return game.actionUseSkill(1, this.entityId, enemy2.isHpLowerThan(0.2) ? enemy2.entityId : enemy.entityId);
  }
}
