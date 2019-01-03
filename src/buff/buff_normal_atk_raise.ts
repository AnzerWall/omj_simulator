import { Member } from '../member';
import {BuffCountDown} from './buff_count_down';

export class BuffNormalAtkRaise extends BuffCountDown {
    rate: number;
    constructor(name: string, rate: number = 1, turn: number = 1) {
        super(name || '攻击提升', turn);
        this.rate = rate;
    }

    actionAdd(source: Member, target: Member): void {

        // 清除同类型低等级或者同等级的buff
        const needRemoveBuffList = target.buffList.filter(buff => buff instanceof BuffNormalAtkRaise && buff.rate <= this.rate);
        needRemoveBuffList.forEach(buff => target.game.actionRemoveBuff(source, target, buff));

        // 增加buff
        target.game.actionAddBuff(source, target, this);
    }

}
