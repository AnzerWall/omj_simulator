import {Entity, Skill} from '../system';
import {BattleProperties} from '../fixtures/hero-property-names';
import Game from '../system/game';
import {EventCodes, EventData, EventRange} from '../fixtures/events';
import Buff, {Effect} from '../system/buff';

class KoJuKai extends Buff {
    constructor(sourceId: number) {
        super();
        this.countDown = 1;
        this.countDownBySource = true;
        this.enchantment = true;
        this.maxCount = 1;
        this.name = '狐狩界';
        this.sourceId = sourceId;
    }
}

const skill1: Skill = {
    no: 1,
    handlers: [],
    passive: false,
    cost: 0,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        return true;
    },
};
const skill2: Skill = {
    no: 2,
    handlers: [{
        // 先机：释放狐狩界
        handle(game: Game, data: EventData): boolean {
            if (!data.skillOwnerId) return false;
            return game.actionUseSkill(2, data.skillOwnerId, data.skillOwnerId);
        },
        code: EventCodes.SENKI,
        range: EventRange.NONE,
        priority: 0,
    }],
    passive: false,
    cost: 3,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        if (!sourceId) return false;
        return game.actionAddBuff(sourceId, sourceId, new KoJuKai(sourceId));
    },
};
const skill3: Skill = {
    no: 3,
    handlers: [],
    passive: false,
    cost: 3,
    use(game: Game, sourceId: number, selectedId: number): boolean {
        return true;
    },
};
export default class Miketsu extends Entity {
    constructor() {
        super();
        this.setProperty(BattleProperties.MAX_HP, 3001.6);
        this.setProperty(BattleProperties.ATK, 12646.12);
        this.setProperty(BattleProperties.DEF, 449.82);
        this.setProperty(BattleProperties.SPD, 119);
        this.setProperty(BattleProperties.CRI, 1.5);
        this.setProperty(BattleProperties.CRI_DMG, 0.05);
        this.no = 304;
        this.name = "御馔津";
        this.hp = 3001.6;
        this.addSkill(skill1);
        this.addSkill(skill2);
        this.addSkill(skill3);
    }
}
