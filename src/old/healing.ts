import {AttackParams, Battle, BattleProperties, HealingParams} from './index';
import Attack from './attack';
import {Processor} from './task';


export class HealingBuilder {
    healing: Healing;
    constructor(healing: Healing) {
        this.healing = healing;
    }
    end(): Healing {
        return this.healing;
    }

    param(...params: HealingParams[]) {
        this.healing.params.push(...params);
        return this;
    }


    limit(limit: ((battle: Battle, sourceId: number, targetId: number) => number) | number) {
        this.healing.limit = limit;
        return this;
    }

    base(base: ((battle: Battle, sourceId: number, targetId: number) => number) | string) {
        this.healing.base = base;
        return this;
    }

    rate(n: number) {
        this.healing.rate = n;
        return this;
    }


    shouldComputeCri(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.healing.params.push(HealingParams.SHOULD_COMPUTE_CRI);
        return this;
    }
}

export default class Healing {
    base: ((battle: Battle, sourceId: number, targetId: number) => number) | string = BattleProperties.MAX_HP; // 基础数值来源
    limit?: ((battle: Battle, sourceId: number, targetId: number) => number) | number; // 不超过xxx
    rate: number = 0; // 倍率
    sourceId: number;
    targetId: number;
    params: HealingParams[] = [];

    hasParam(p: HealingParams) {
        return this.params.includes(p);
    }

    addParam(p: HealingParams) {
        this.params.push(p);
    }
    constructor(sourceId: number, targetId: number) {
        this.sourceId = sourceId;
        this.targetId = targetId;
    }
    static build(sourceId: number, targetId: number) {
        return new HealingBuilder(new Healing(sourceId, targetId))
    }
}
