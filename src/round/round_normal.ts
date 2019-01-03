import { RoundBase } from './round_base';
import { Game } from '../game';
import { Member } from '../member';
// https://bbs.nga.cn/read.php?tid=14070150&_fp=4
export class RoundNormal extends RoundBase {
    game: Game;
    member: Member;
    constructor(game: Game, member: Member) {
        super();
        this.game = game;
        this.member = member;
    }

    run(): void {
        this.game.turnBar.reset(this.member);

        this.member.action();

        this.member.processBuffCountDown();
        this.member.team.energy.growProgress(); // 推进鬼火条
    }
}
