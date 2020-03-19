import {Buff, Entity, Operator, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import BuffSkill from '../common/buff-skill';
import Attack, {AttackTargetInfo} from '../../system/attack';
import {EventData} from '../../fixtures/events';
import {Reasons} from '../../fixtures/reasons';

/**
 * {
    "index": 139,
    "rank": "N",
    "name": "赤舌",
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
    "name_jp": "赤舌",
    "name_en": "Akashita",
    "name_roma": "akajita",
    "name_kana": "あかじた",
    "id": 246
  },
 */
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
    }]

  }
}
const skill3: Skill = {
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
      const attack: Attack = {
        sourceId: sourceId,
        targetsInfo: entities.map(e => {
          const at = new AttackTargetInfo(e.entityId);
          at.rate = 0.72;
          at.shouldComputeCri = true;
          at.isGroupDamage = true;
          at.onComputed = function (game: Game, data: EventData) : boolean { // 造成伤害时
            if (game.testHit(0.3)) {
              if (!data.targetId) return false;
              game.actionUpdateRunwayPercent(sourceId, data.targetId, -1, Reasons.SKILL);
            }
            return true;
          };
          return at;
        }),
      };
      if (!game.actionAttack(attack)) return false;

    }
    return true;
  },
};
export default class AkaJita extends Entity {
  static no = 246;
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 246;
    this.name = '赤舌';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new NormalAttack('海扁'));
    this.addSkill(new BuffSkill(2, '鼓舞', 2, (_, sourceId) => new HageriBuff(sourceId)));
    this.addSkill(skill3);

  }

  ai(game: Game, turn: any): boolean {
    /**
     赤舌
     --技能选择
     当敌方单位数大于等于2时：
     鬼火大于等于3时：使用3技能[风鼓雷]。
     鬼火小于3时：使用1技能[海扁]。
     当敌方单位数小于2时：
     鬼火大于5时：使用3技能[风鼓雷]。
     鬼火小于等于5时：使用1技能[海扁]。
     上述鬼火判定中的“3”在非通常情况下受其他因素影响(如真大蛇、苍风一目连)，“5”不受影响。
     --目标选择
     1技能[海扁]：当敌方有生命比例在20%以下的单位时，优先选择其中生命比例最低的单位为目标。
     */
    const enemies = game.getEnemies(this.entityId);
    if (enemies.length === 0 ) return false;

    const line = enemies.length >= 2 ? 5 : 3;

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
