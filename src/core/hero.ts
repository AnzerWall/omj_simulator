import { Entity } from './entity';
import { BattleProperties, BattleStatus } from '../fixtures/hero-property-names';
import { values, forEach } from 'lodash';
export default class Hero extends Entity {
    team_id: number; // 队伍id
    position: number; // 位置
    hp: number; // 生命值
    shield: number; // 生命值
    index: number; // 式神编号
    constructor() {
        super();
        this.team_id = 0;
        this.position = 0;
        this.hp = 1;
        this.shield = 0;
        this.index = 0;
        forEach(values(BattleProperties), key => {
           this.setProperty(key, 0);
        });
        forEach(values(BattleStatus), key => {
            this.setProperty(key, 0);
        });
        this.setProperty(BattleProperties.MAX_HP, 1);
    }
}
