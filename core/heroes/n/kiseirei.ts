import {Entity} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';

/**

 {
    "index": 137,
    "rank": "N",
    "name": "寄生魂",
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
    "name_jp": "寄生霊",
    "name_en": "Parasite",
    "name_roma": "kiseirei",
    "name_kana": "きせいれい",
    "id": 401
  },
 */
export default class KiSeiRei extends Entity {
    static no = 401;

    constructor() {
        super();
        this.setProperty(BattleProperties.ATK, 2412);
        this.setProperty(BattleProperties.MAX_HP, 10253.8);
        this.setProperty(BattleProperties.DEF, 396.9);
        this.setProperty(BattleProperties.SPD, 100);
        this.setProperty(BattleProperties.CRI, 0);
        this.setProperty(BattleProperties.CRI_DMG, 1.5);
        this.no = 401;
        this.name = '寄生魂';
        this.hp = this.getProperty(BattleProperties.MAX_HP);
        this.rank = 'N';
        this.addSkill(new NormalAttack('投火'));
    }

    ai(game: Game, turn: any): boolean {
        /**
         寄生魂
         --技能选择
         使用1技能[投火]。
         --目标选择
         1技能[投火]：当敌方有生命比例在20%以下的单位时，优先选择其中生命比例最低的单位为目标。
         */

        const enemy = game.getRandomEnemy(this.entityId);
        if (!enemy) return false;

        const entities = game.getEnemies(this.teamId).sort((a, b) => a.hp - b.hp);
        const enemy2 = entities[0];
        if (!enemy2) return false;

        return game.actionUseSkill(1, this.entityId, enemy2.isHpLowerThan(0.2) ? enemy2.entityId : enemy.entityId);
    }
}
