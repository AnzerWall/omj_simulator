import {AttackParams, Battle, BattleProperties} from "./index";
import {Processor} from "./task";

export class AttackBuilder {
    attack: Attack;
    constructor(attack: Attack) {
        this.attack = attack;
    }

    end(): Attack {
        return this.attack;
    }

    param(...params: AttackParams[]) {
        this.attack.params.push(...params);
        return this;
    }
    tag(...tags: string[]) {
        this.attack.tags.push(...tags);
        return this;
    }

    FR(n: number) {
        this.attack.FR = n;
        return this;
    }

    limit(limit: ((battle: Battle, sourceId: number, targetId: number) => number) | number) {
        this.attack.limit = limit;
        return this;
    }

    base(base: ((battle: Battle, sourceId: number, targetId: number) => number) | string) {
        this.attack.base = base;
        return this;
    }

    rate(n: number) {
        this.attack.rate = n;
        return this;
    }
    normal() {
        this.attack.addParam(AttackParams.NORMAL);
        return this;
    }

    completed(p: Processor) {
        this.attack.completedProcessor = p;
        return this;
    }

    shouldComputeCri(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.SHOULD_COMPUTE_CRI);
        return this;
    }
    conduction(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.CONDUCTION);
        return this;
    }
    indirect(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.INDIRECT);
        return this;
    }

    real(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.REAL);
        return this;
    }

    critical(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.CRITICAL);
        return this;
    }

    normalAttack(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.SINGLE);
        this.attack.params.push(AttackParams.NORMAL_ATTACK);
        return this;
    }

    single(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.SINGLE);
        return this;
    }
    group(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.GROUP);
        return this;
    }
    ignoreSource(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.IGNORE_SOURCE);
        return this;
    }
    noShare(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.NO_SHARE);
        return this;
    }
    noTargetEquipment(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.NO_TARGET_EQUIPMENT);
        return this;
    }
    noEargetPassive(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.NO_TARGET_PASSIVE);
        return this;
    }
    noSourceEquipment(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.NO_SOURCE_EQUIPMENT);
        return this;
    }
    noSourcePassive(isAdd: boolean = true) {
        if(!isAdd) return this;
        this.attack.params.push(AttackParams.NO_SOURCE_PASSIVE);
        return this;
    }
}

export default class Attack {
    targetId: number;
    sourceId: number;
    base: ((battle: Battle, sourceId: number, targetId: number) => number) | string; // 基础数值来源
    limit?: ((battle: Battle, sourceId: number, targetId: number) => number) | number; // 不超过xxx
    rate: number; // 倍率
    completedProcessor?: Processor; // 完成后触发的处理者
    FR: number;
    params: AttackParams[] = [];
    tags: string[];

    hasParam(p: AttackParams) {
        return this.params.includes(p);
    }

    addParam(p: AttackParams) {
        this.params.push(p);
    }

    hasTag(t: string) {
        return this.tags.includes(t);
    }

    addTag(t: string) {
        this.tags.push(t);
    }
    constructor(targetId: number, sourceId: number) {
        this.targetId = targetId;
        this.sourceId = sourceId;
        this.base = BattleProperties.ATK;
        this.rate = 1;
        this.FR = 0.01;
        this.params = [];
        this.tags = [];
    }

    static build(targetId: number, sourceId: number): AttackBuilder {
        return new AttackBuilder(new Attack(targetId, sourceId))
    }


}
