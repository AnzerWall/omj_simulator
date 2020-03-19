import {Entity, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import Attack, {AttackTargetInfo} from '../../system/attack';
import {GroupAttack} from '../common/group-attack';

/**
   {
    "index": 136,
    "rank": "N",
    "name": "唐纸伞妖",
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
    "name_jp": "からかさ小僧",
    "name_en": "Umbrella",
    "name_roma": "karakasa kozou",
    "name_kana": "からかさこぞう",
    "id": 403
  },
 */
const skill2: Skill = {
  no: 2,
  handlers: [],
  passive: false,
  cost: 2,
  name: '天旋地转',
  use(game: Game, sourceId: number, selectedId: number): boolean {
    const source = game.getEntity(sourceId);
    if (!source) return false;

    const entities = game.getTeamEntities(source.teamId);

    const attack: Attack = {
      sourceId: sourceId,
      targetsInfo: entities.map(e => {
        const t = new AttackTargetInfo(e.entityId);
        t.isGroupDamage = true; // 群体伤害
        t.shouldComputeCri = true;
        t.rate = 1.29; // 攻击129%伤害
        return t;
      }),
    };
    return game.actionAttack(attack);
  },
};
export default class KaraKasaKoZou extends Entity {
  static no = 403;
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 403;
    this.name = '唐纸伞妖';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new NormalAttack('我顶！'));
    this.addSkill(new GroupAttack(2, '天旋地转', 1.29, 2,2 ))
  }
  ai(game: Game, turn: any): boolean {
    /**
     唐纸伞妖
     --技能选择
     使用2技能[天旋地转]。
     --目标选择
     1技能[我顶！]：当敌方有生命比例在20%以下的单位时，优先选择其中生命比例最低的单位为目标。
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
