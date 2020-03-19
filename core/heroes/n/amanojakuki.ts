import {Buff, Entity, Operator, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import {Reasons} from '../../fixtures/reasons';

/**
 {
    "index": 133,
    "rank": "N",
    "name": "天邪鬼黄",
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
    "name_jp": "天邪鬼黄",
    "name_en": "Yellow Imp",
    "name_roma": "amanojaku ki",
    "name_kana": "あまのじゃくき",
    "id": 406
  },
 **/

class ChanChanChanBuff extends Buff {
  constructor(sourceId: number) {
    super(sourceId);
    this.canDispel = true;
    this.canRemove = true;
    this.name = '锵锵锵';
    this.maxCount = 1;
    this.visible = true;

    // 维持一个回合
    this.countDownBySource = true;
    this.countDown = 1;

    // 【增益, 状态】 提升15%暴击
    this.isAffectProperty = true;
    this.isBuff = true;

    this.effects = [{
      propertyName: BattleProperties.CRI,
      op: Operator.ADD,
      value: 0.15
    }]

  }
}

const skill2: Skill = {
  no: 2,
  handlers: [],
  passive: false,
  cost: 0,
  name: '锵锵锵',
  use(game: Game, sourceId: number, selectedId: number): boolean {
    const source = game.getEntity(sourceId);
    if (!source) return false;

    const entities = game.getTeamEntities(source.teamId);
    entities.forEach(e => {
      game.actionAddBuff(sourceId, e.entityId, new ChanChanChanBuff(sourceId), Reasons.SKILL);
    });

    return true;
  },
};
export default class AmoNoJakuKi extends Entity {
  static no = 406;
  constructor() {
    super();
    this.setProperty(BattleProperties.ATK, 2412);
    this.setProperty(BattleProperties.MAX_HP, 10253.8);
    this.setProperty(BattleProperties.DEF, 396.9);
    this.setProperty(BattleProperties.SPD, 100);
    this.setProperty(BattleProperties.CRI, 0);
    this.setProperty(BattleProperties.CRI_DMG, 1.5);
    this.no = 406;
    this.name = '天邪鬼黄';
    this.hp = this.getProperty(BattleProperties.MAX_HP);
    this.rank = 'N';
    this.addSkill(new NormalAttack('咚咚'));
    this.addSkill(skill2);
  }

  ai(game: Game, turn: any): boolean {
    /**
     天邪鬼黄
     --技能选择
     当所有友方单位均无锵锵锵时，使用2技能[锵锵锵]。
     当存在友方单位拥有锵锵锵时，使用1技能[咚咚]。
     注：锵锵锵是天邪鬼黄提供给队友的buff，提升15%暴击。
     --目标选择
     1技能[咚咚]：随机。
     */
    const entities = game.getTeamEntities(this.teamId);

    if (entities.every(e => !e.hasBuffNamed('锵锵锵'))) {
      if (game.actionUseSkill(2, this.entityId, this.entityId)) return true;
    }

    const enemy = game.getRandomEnemy(this.entityId);
    if (!enemy) return false;
    return game.actionUseSkill(1, this.entityId, enemy.entityId);
  }
}
