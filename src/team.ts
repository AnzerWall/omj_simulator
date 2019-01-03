import { Member } from './member';
import { Game } from './game';
import { Energy } from './energy';
export class Team {
    members: Member[]; // 队伍成员
    name: string; // 队伍名称
    game: Game; // 游戏
    enemy: Team; // 敌人
    energy: Energy = new Energy(); // 鬼火机制

    constructor(name: string) {
        this.name = name;
        this.members = [];
    }

    addMember(m: Member): void {
        this.members.push(m);
        m.team = this;
    }
}
