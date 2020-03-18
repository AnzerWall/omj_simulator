import {Entity, Skill} from '../../system';
import {BattleProperties} from '../../fixtures/hero-property-names';
import Handler from '../../system/handler';
import Game from '../../system/game';
import {EventCodes, EventData, EventRange} from '../../fixtures/events';
import Buff, {Effect, Operator} from '../../system/buff';

class KoJuKai implements Buff {
    can_dispel: boolean;
    can_remove: boolean;
    countDown: number;
    enchantment: boolean;
    maxCount: number;
    name: string;
    source_entity_id: number;
    stamp: boolean;
    countDownBySource: boolean;
    effects: Effect[];
    constructor(source_entity_id: number) {
        this.can_dispel = false;
        this.can_remove = false;
        this.countDown = 1;
        this.countDownBySource = true;
        this.enchantment = true;
        this.maxCount = 1;
        this.name = '狐狩界';

        this.source_entity_id = source_entity_id;
        this.stamp = false;
        this.effects = [];
    }


}
const skill1: Skill = {
    no: 1,
    handlers: [],
    passive: false,
    cost: 0,
    use(game: Game, source_entity_id: number, selected_entity_id: number): boolean {
        return true;
    },
};
const skill2: Skill = {
    no: 2,
    handlers: [{
        // 先机：释放狐狩界
        handle(game: Game, data: EventData): boolean {
            if (!data.skill_entity_id) return false;
            return game.action_use_skill(2, data.skill_entity_id, data.skill_entity_id);
        },
        code: EventCodes.SENKI,
        range: EventRange.NONE,
        priority: 0,
    }],
    passive: false,
    cost: 3,
    use(game: Game, source_entity_id: number, selected_entity_id: number): boolean {
        if (!source_entity_id) return false;
        return game.action_add_buff(source_entity_id, source_entity_id, new KoJuKai(source_entity_id));
    },
};
const skill3: Skill = {
    no: 3,
    handlers: [],
    passive: false,
    cost:3,
    use(game: Game, source_entity_id: number, selected_entity_id: number): boolean {
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
