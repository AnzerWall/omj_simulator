import { Entity } from './entity';
import { BattleProperties, BattleStatus } from '../fixtures/hero-property-names';
import { values, forEach } from 'lodash';
export default class Hero extends Entity {
    position: number; // 位置
    hp: number; // 生命值
    shield: number; // 生命值
    id: number; // 式神编号
    constructor() {
        super();
        this.team_id = 0;
        this.position = 0;
        this.hp = 1;
        this.shield = 0;
        this.id = 0;
        this.important = true;
        forEach(values(BattleProperties), key => {
           this.setProperty(key, 0);
        });
        forEach(values(BattleStatus), key => {
            this.setProperty(key, 0);
        });
        this.setProperty(BattleProperties.MAX_HP, 1);
        this.addTags('hero')
    }

    skill(no: number, target: Entity) {

    }
}
