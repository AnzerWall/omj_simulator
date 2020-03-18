import {Entity} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';

export default class Miketsu extends Entity {
    constructor() {
        super();
        this.setProperty(BattleProperties.MAX_HP, 3001.6);
        this.setProperty(BattleProperties.ATK, 12646.12);
        this.setProperty(BattleProperties.DEF, 449.82);
        this.setProperty(BattleProperties.SPD, 119);
        this.setProperty(BattleProperties.CRI, 0.05);
        this.setProperty(BattleProperties.CRI_DMG, 0.05);
        this.no = 304;
        this.name = "御馔津";
        this.hp = 3001.6;
    }
}
