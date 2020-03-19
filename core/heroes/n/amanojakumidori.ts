import {Entity, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import {NormalAttack} from '../common/normal-attack';
import Game from '../../system/game';
import Attack, {AttackTargetInfo} from '../../system/attack';

/**
 {
    "index": 135,
    "rank": "N",
    "name": "天邪鬼绿",
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
    "name_jp": "天邪鬼緑",
    "name_en": "Green Imp",
    "name_roma": "amanojaku midori",
    "name_kana": "あまのじゃくみどり",
    "id": 404
  },
 ))
 */
const skill2: Skill = {
    no: 2,
    handlers: [],
    passive: false,
    cost: 0,
    name: '我打打打',
    use(game: Game, sourceId: number, selectedId: number): boolean {
        for (let i = 0; i < 3; i++) {
            const t = new AttackTargetInfo(selectedId);
            t.isSingleDamage = true;
            t.shouldComputeCri = true;
            t.rate = 0.88;
            const attack: Attack = {
                sourceId: sourceId,
                targetsInfo: [t],
            };
            if (game.actionAttack(attack)) return false;
        }
        return true;
    },
};
export default class AmoNoJakuMidori extends Entity {
    static no = 404;

    constructor() {
        super();
        this.setProperty(BattleProperties.ATK, 2412);
        this.setProperty(BattleProperties.MAX_HP, 10253.8);
        this.setProperty(BattleProperties.DEF, 396.9);
        this.setProperty(BattleProperties.SPD, 100);
        this.setProperty(BattleProperties.CRI, 0);
        this.setProperty(BattleProperties.CRI_DMG, 1.5);
        this.no = 404;
        this.name = '天邪鬼緑';
        this.hp = this.getProperty(BattleProperties.MAX_HP);
        this.rank = 'N';
        this.addSkill(new NormalAttack('我打'));
        this.addSkill(skill2);
    }

    ai(game: Game, turn: any): boolean {
        /**
         天邪鬼绿
         --技能选择
         使用2技能[我打打打]。
         --目标选择
         1技能[我打]：当敌方有生命比例在20%以下的单位时，优先选择其中生命比例最低的单位为目标。
         2技能[我打打打]：随机。
         */

        const enemy = game.getRandomEnemy(this.entityId);
        if (!enemy) return false;
        if (game.actionUseSkill(2, this.entityId, enemy.entityId)) return true;

        const entities = game.getEnemies(this.teamId).sort((a, b) => a.hp - b.hp);
        const enemy2 = entities[0];
        if (!enemy2) return false;

        return game.actionUseSkill(1, this.entityId, enemy2.isHpLowerThan(0.2) ? enemy2.entityId : enemy.entityId);
    }
}
