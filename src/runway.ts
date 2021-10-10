const eps = 1e-6; // 精度
const GOAL = 10000; // 行动条终点
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

export interface Runway {
    distanceTable: Record<string, number>; // 实体在行动条上的位置
    frozenTable: Record<string, boolean>; // 实体是否在行动条上冻结
    queue: Array<number>
}

export function runwayNew(): Runway {
    return {
        distanceTable: {},
        frozenTable: {},
        queue: [],
    }
}
export function runwayAdd(r: Runway, entityId: number): Runway {
    return {
        distanceTable: {
            ...r.distanceTable,
            [entityId]: 0
        },
        frozenTable: {
            ...r.frozenTable,
            [entityId]: false
        },
        queue: [...r.queue, entityId],
    }
}
export function removeEntity(r: Runway, entityId: number): Runway {
    const rr = {
        distanceTable: {
            ...r.distanceTable
        },
        frozenTable: {
            ...r.frozenTable
        },
        queue: r.queue.filter(id => id !== entityId),
    }
    delete rr.distanceTable[entityId]
    delete rr.frozenTable[entityId]
    return rr
}

export function runwayUpdatePercent(r: Runway, entityId: number, percent: number): Runway {
    if (r.distanceTable[entityId] === undefined) return r


    const prevDistance = r.distanceTable[entityId]  || 0;
    const nextDistance = Math.max(Math.min(prevDistance + (GOAL * percent), GOAL), 0);

    return runwaySet(r, entityId, nextDistance);
}


// 设置位置
export function runwaySet(r: Runway, entityId: number, distance: number): Runway {
    if (r.distanceTable[entityId] === undefined) return r
    const newTable: Record<string, number> = {
        ...r.distanceTable,
        [entityId]: Math.min(GOAL, Math.max(0, distance))
    }
    const newQueue = []
    let added = false
    for (let i = 0; i < r.queue.length; i++) {
        const id = r.queue[i]
        if (id === entityId) continue
        if (newTable[id] < newTable[entityId]) {
            newQueue.push(entityId)
            added = true
        }
        newQueue.push(id)
    }

    if (!added) {
        newQueue.push(entityId)
    }


    return {
        distanceTable: newTable,
        frozenTable: r.frozenTable,
        queue: newQueue,
    }
}

// 冻结实体
export function runwayFreeze(r: Runway, entityId: number, isFrozen: boolean = true): Runway {
    if (r.distanceTable[entityId] === undefined) return r

    return {
        distanceTable: r.distanceTable,
        frozenTable: {
            ...r.frozenTable,
            [entityId]: isFrozen
        },
        queue: r.queue,
    }
}

export function runwayGetNext(r: Runway, random = Math.random): number {
    let reachGoalEntities: number[] = [];
    for(let i = 0; i < r.queue.length; i++) {
        const id = r.queue[i]
        if (!isReachGoal(r.distanceTable[id])) break

        if (r.frozenTable[id] === false) {
            reachGoalEntities.push(id)
        }
    }


    if (!reachGoalEntities.length) return -1;

    const id = reachGoalEntities[Math.floor(random() * reachGoalEntities.length)];
    if (id === undefined) return -1;

    return id;
}
export function runwayCompute(r: Runway, speedTable: Record<string, number>): Runway {
    let allFrozen = true;
    let minT: number = +oo;
    for (const id in r.distanceTable) {
        if (r.frozenTable[id]) continue;
        const speed = speedTable[id] || 0; // 获取实体速度
        if (speed < 0 || feq(speed, 0)) continue
        minT = Math.min(minT, getReachGoalTime(r.distanceTable[id], speed)); // 计算到达终点时间
        allFrozen = false;
    }

    if (allFrozen) return r; // 如果队列为空或者所有单位都已经冻结，返回空
    const newTable: Record<string, number> = {
        ...r.distanceTable,
    }
    const newQueue = r.queue.slice()

    // 更新所有单位的当前位置
    for (const id in r.distanceTable) {
        if (r.frozenTable[id]) continue;
        const speed = speedTable[id] || 0; // 获取实体速度

        if (speed < 0 || feq(speed, 0)) continue // 忽略低速单位
        const newDistance = Math.min(r.distanceTable[id] + speed * minT, GOAL);
        newTable[id] = newDistance;
    }
    newQueue.sort((a, b) => {
        return newTable[b] - newTable[a]
    })

    return {
        distanceTable: newTable,
        frozenTable: r.frozenTable,
        queue: newQueue,
    }
}

