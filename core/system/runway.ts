import {sample} from 'lodash';

const eps: number = 1e-6; // 精度
const GOAL: number = 10000; // 行动条终点
const oo = 1e10; // 无限大

function feq(a: number, b: number): boolean {
    return Math.abs(a - b) < eps;
}

// 计算到达终点的时间
function getReachGoalTime(d: number, v: number): number {
    return (GOAL - d) / v;
}

// 判断是否到达终点
function isReachGoal(pos: number): boolean {
    return feq(pos, GOAL);
}

function lowVelocity() {
    return eps;
}

export default class Runway {
    distanceTable: Map<number, number>; // 实体在行动条上的位置
    velocityFunctions: Map<number, () => number>; // 实体的速度
    frozenTable: Map<number, boolean>; // 实体是否在行动条上冻结
    constructor() {
        this.distanceTable = new Map<number, number>();
        this.velocityFunctions = new Map<number, () => number>();
        this.frozenTable = new Map<number, boolean>();
    }

    reset() {
        this.distanceTable.clear();
        this.velocityFunctions.clear();
        this.frozenTable.clear();
    }

    addEntity(id: number, velocityFunction: () => number) {
        this.distanceTable.set(id, 0);
        this.velocityFunctions.set(id, velocityFunction);
        this.frozenTable.set(id, false);
    }

    removeEntity(id: number) {
        this.distanceTable.delete(id);
        this.velocityFunctions.delete(id);
        this.frozenTable.delete(id);
    }

    // 处理行动条
    compute(): boolean {
        // 计算出最快到达行动条底端的单位的时间
        let allFrozen = true;
        let minT: number = +oo;
        for (const [id, dis] of this.distanceTable) {
            if (this.frozenTable.get(id)) continue;
            const fn = this.velocityFunctions.get(id) || lowVelocity;
            const velocity = fn() || eps; // 获取实体速度
            minT = Math.min(minT, getReachGoalTime(dis, velocity)); // 计算到达终点时间
            allFrozen = false;
        }

        if (allFrozen) return false; // 如果队列为空或者所有单位都已经冻结，返回空

        // 更新所有单位的当前位置
        for (const [id, dis] of this.distanceTable) {
            if (this.frozenTable.get(id)) continue; // 不更新冻结单位的位置
            const fn = this.velocityFunctions.get(id) || lowVelocity;
            const velocity = fn() || eps; // 获取实体速度
            const newDistance = Math.min(dis + velocity * minT, GOAL);
            this.distanceTable.set(id, newDistance);
        }
        return true;
    }

    // 获得下一个行动的单位
    getNext(): number | null {
        let reachGoalEntities: number[] = [];
        let maxVelocity = 0;

        for (const [id, dis] of this.distanceTable) {
            if (isReachGoal(dis) && !this.frozenTable.get(id)) {
                const fn = this.velocityFunctions.get(id) || lowVelocity;
                const velocity = fn() || eps; // 获取实体速度

                // 接下来从到达终点中取出速度最快的实体
                if (feq(velocity, maxVelocity)) {
                    reachGoalEntities.push(id);
                } else if (velocity > maxVelocity) {
                    reachGoalEntities = [id]; // 更新为较快的实体
                    maxVelocity = velocity; // 更新最大速度
                }
            }
        }

        if (!reachGoalEntities.length) return null;

        const id = sample(reachGoalEntities);
        if (id === undefined) return null;

        this.distanceTable.set(id, 0);
        return id;
    }

    computeNext(): number {
        this.compute();
        return this.getNext() || 0;
    }

    // 拉条
    raise(id: number, percent: number): boolean {
        if (!this.distanceTable.has(id)) {
            return false;
        }
        if (this.frozenTable.get(id)) return false;
        if (percent <= 0) return true; // 拉条小于等于0，直接成功
        if (percent >= 1) {
            percent = 1;
        }

        const prevDistance = this.distanceTable.get(id) || 0;
        const nextDistance = Math.min(prevDistance + (GOAL * percent), GOAL);

        this.distanceTable.set(id, nextDistance);
        return true;
    }

    // 获取位置
    get(id: number): number | null {
        return this.distanceTable.get(id) || null;
    }

    // 设置位置
    set(id: number, distance: number): boolean {
        if (!this.distanceTable.has(id) || this.frozenTable.get(id)) {
            return false;
        }

        this.distanceTable.set(id, Math.min(GOAL, Math.max(0, distance)));
        return true;
    }

    // 冻结实体
    freeze(id: number, isFrozen: boolean = true): boolean {
        if (!this.distanceTable.has(id)) {
            return false;
        }
        this.frozenTable.set(id, isFrozen);
        return true;
    }

}

// const runway = new Runway();
// runway.addEntity(1, () => 273);
// runway.freeze(1);
// console.log(runway.computeNext());
