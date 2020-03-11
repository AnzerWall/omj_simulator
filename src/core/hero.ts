import { Entity } from './entity';

export default class Hero extends Entity {
    team_id: number; // 队伍id
    position: number; // 位置
    hp: number; // 生命值
    shield: number; // 生命值
    constructor() {
        super();
        this.team_id = 0;
        this.position = 0;
        this.hp = 1;
        this.shield = 0;
    }
}
