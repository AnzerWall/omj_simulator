import Battle from './battle';
import {AttackParams, BattleProperties} from './constant';
import {Processor} from './task';
import { get } from 'lodash';

type ValueFunction = (battle: Battle, sourceId: number, targetId: number) => number
type AttackTargetOptions = {
    sourceId?: number;
    base?: ValueFunction | string;
    rate?: number;
    FR?: number;
    limit?: ValueFunction | number;
    completedProcessor?: Processor;
    params?: AttackParams[];
}
export class AttackInfo {
    targetId: number;
    sourceId: number;
    base: ((battle: Battle, sourceId: number, targetId: number) => number) | string; // 基础数值来源
    limit?: ((battle: Battle, sourceId: number, targetId: number) => number) | number; // 不超过xxx
    rate: number; // 倍率
    completedProcessor?: Processor; // 完成后触发的处理者

    params: AttackParams[] = [];

    hasParam(p: AttackParams) {
        return this.params.includes(p);
    }
    addParam(p: AttackParams | null) {
        if (p) {
            this.params.push(p);
        }
        return this;
    }

    constructor(targetId: number, options: AttackTargetOptions) {
        this.targetId = targetId;
        this.sourceId = get(options, 'sourceId', 0);
        this.base = get(options, 'base', BattleProperties.ATK);
        this.rate = get(options, 'rate', 1);
        this.FR = get(options, 'FR', 0.01);
        this.params = get(options, 'params', []);


        if ('completedProcessor' in options) this.completedProcessor = options.completedProcessor;
        if ('limit' in options) this.limit = options.limit;
    }

    // 比较少需要指定的参数
    FR: number; // 波动值

    // 处理攻击的中间信息，修改影响结果
    critical: number = 0; // 暴击率
    criticalDamage: number = 0; // 暴击伤害

    damageDealtBuff: number = 1; // 造成伤害增加
    damageDealtDebuff: number = 1; // 造成伤害减少
    targetDamageTakenBuff: number = 1; // 目标承受伤害增加
    targetDamageTakenDebuff: number = 1; // 目标承受伤害减少

    targetDefence: number = 0; // 目标防御分子
    damage: number = 0;

    finalDamage: number = 0; // 最终伤害
    isCri: boolean = false; // 是否暴击
}
