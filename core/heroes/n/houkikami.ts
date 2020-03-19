import {Entity, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import {GroupAttack} from '../common/group-attack';
import Attack, {AttackTargetInfo} from '../../system/attack';

/**
 {
    "index": 131,
    "rank": "N",
    "name": "帚神",
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
    "name_jp": "箒神",
    "name_en": "Hakakigami",
    "name_roma": "houkikami",
    "name_kana": "ほうきかみ",
    "id": 408
  },*/
const skill1: Skill = {
  no: 1,
  handlers: [],
  passive: false,
  cost: 0,
  name: '蓄力一攻',
  use(game: Game, sourceId: number, selectedId: number): boolean {
    const at = new AttackTargetInfo(selectedId);
    at.base = (game: Game, sourceId: number, targetId: number) :number => {
      const target = game.getEntity(targetId);
      if (!target) return 0;
      return target.getComputedProperty(BattleProperties.ATK);
    };
    at.limit = (game: Game, sourceId: number, targetId: number) :number => {
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
export default class HoukiKami extends Entity {
  static no = 408;
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 408;
    this.name = '帚神';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(skill1); // 妈蛋怎么还有不超过xxx的
    this.addSkill(new GroupAttack(2, '大扫除', 1.31, 2))
  }

  ai(game: Game, turn: any): boolean {
    /**
     帚神
     --技能选择
     当敌方单位数大于等于2时：
     鬼火大于等于2时：使用2技能[大扫除]。
     鬼火小于2时：使用1技能[蓄力一击]。
     当敌方单位数小于2时：
     鬼火大于5时：使用2技能[大扫除]。
     鬼火小于等于5时：使用1技能[蓄力一击]。
     上述鬼火判定中的“2”在非通常情况下受其他因素影响(如真大蛇、苍风一目连)，“5”不受影响。
     --目标选择
     1技能[蓄力一击]：随机。
     */
    const enemies = game.getEnemies(this.entityId);
    if (enemies.length === 0 ) return false;

    const line = enemies.length >= 2 ? 5 : 2;

    const mana = game.getMana(this.teamId);
    if (!mana) return false;
    if (mana.num > line) {
      if (game.actionUseSkill(2, this.entityId, enemies[0].entityId)) return true;
    }


    const enemy = game.getRandomEnemy(this.entityId);
    if (!enemy) return false;
    return game.actionUseSkill(1, this.entityId, enemy.entityId);
  }
}
