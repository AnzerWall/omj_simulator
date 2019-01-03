import { BuffBase } from './buff_base';
import { Member } from '../member';

export class BuffCountDown extends BuffBase {
    turn: number;
    constructor(name: string, turn: number) {
        super(name || '倒计时buff');
        this.turn = turn || 0;
    }

    countDown() {
        this.turn -= 1;
        console.log(`[buff回合结算] ${this.name}的回合数-1，当前剩余回合数${this.turn}`);
        if (this.turn <= 0) {
            this.removeFromTarget();
        }
    }

}
