// {
//     "index": 1,
//     "rank": "SP",
//     "name": "炼狱茨木童子",
//     "atk": 3323.2,
//     "hp": 10253.8,
//     "def": 379.26,
//     "spd": 112,
//     "cri": 0.15,
//     "cri_dmg": 1.5,
//     "evolve": "-",
//     "atk_pt": 124,
//     "hp_pt": 90,
//     "def_pt": 86,
//     "total_pt": 300
// }
import Hero from '../core/hero';
import { BattleProperties } from '../fixtures/hero-property-names';

export default function build (data) {
    return class SimpleHero extends Hero {
        constructor() {
            super();
            this.setProperty(BattleProperties.MAX_HP, data.hp);
            this.setProperty(BattleProperties.ATK, data.atk);
            this.setProperty(BattleProperties.DEF, data.def);
            this.setProperty(BattleProperties.SPD, data.spd);
            this.setProperty(BattleProperties.CRI, data.cri);
            this.setProperty(BattleProperties.CRI_DMG, data.cri_dmg);
            this.index = data.index;
        }
    };
}
