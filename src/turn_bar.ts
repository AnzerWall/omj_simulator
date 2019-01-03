
import { Member } from './member';
import { TURN_BAR_GOAL } from './common/constant';
import { feq, oo } from './common/util';

function getReachGoalTime(pos: number, speed: number): number {
    return (TURN_BAR_GOAL - pos) / speed;

}

function isReachGoal(pos: number): boolean {
    return feq(pos, TURN_BAR_GOAL);
}

/**
 * 模拟行动条，初始位置都是0，速度为单位速度，终点为10000
 */
export class TurnBar {
    members: Member[] = [];
    waitingMembers: Member[] = [];
    positionMap: Map<Member, number> = new Map<Member, number>(); // 以member为key，单位位置为value
    // 获取对象位置
    getPosition(member: Member): number {
        return this.positionMap.get(member) || 0;
    }

    // 加入对象
    addMember(member: Member): void {
        this.members.push(member);
        this.positionMap.set(member, 0);
    }
    // 重置进度条， 比如回合开始
    reset(member: Member): void {
        if (this.positionMap.has(member)) {
            this.positionMap.set(member, 0);
        }
    }
    // 获得下一个行动的单位
    getNext(): Member {
        if (!this.waitingMembers.length) { // 等待队列为空，生成等待队列
            let t: number = +oo;
            for (const [ member, pos ] of this.positionMap) t = Math.min(t, getReachGoalTime(pos, member.speed));

            const reachGoalMembers: Member[] = [];
            for (const [ member, pos ] of this.positionMap) {
                if ((member as Member).isLive()) {
                    const newPos = Math.min(pos + member.speed * t, TURN_BAR_GOAL);

                    this.positionMap.set(member, newPos);
                    if (isReachGoal(newPos)) reachGoalMembers.push(member);

                }
            }

            this.waitingMembers.push(...reachGoalMembers);
        }

        return this.waitingMembers.shift();
    }
    // 拉条
    percentRaise(member: Member, percent: number): void {
        if (this.positionMap.has(member)) {
            this.positionMap.set(member, Math.min(this.positionMap.get(member) + (TURN_BAR_GOAL * percent / 100) , TURN_BAR_GOAL));
        }
    }

}
