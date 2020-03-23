import {BuffParams, Control} from './constant';

export const enum EffectTypes {
    FIXED, // 增加固定数值value
    SET,  // 设置为value
    ADD_RATE, // 增加倍率
    MAX, // 取最大
    MIN, // 取最小
}

export interface Effect {
    propertyName: string; // 属性名
    value: number; // 值   | ((battle: Battle, ownerId: number)=> number)
    effectType: EffectTypes;
}
let buffCounter = 0;

export class BuffBuilder {
    public _buff: Buff;
    constructor(sourceId: number, owner: number) {
        this._buff = new Buff(sourceId, owner);
    }

    shield(num: number) {
        this._buff.shield = num;
        this._buff.params.push(BuffParams.SHIELD);
        return this;
    }

    icon(uri: string) {
        this._buff.icon = uri;
        this._buff.params.push(BuffParams.VISIBLE);
        return this;
    }

    probability(probability: number) {
        this._buff.probability = probability;
        this._buff.params.push(BuffParams.SHOULD_COMPUTE_PROBABILITY);
        return this;
    }

    noDispel() {
        this._buff.params.push(BuffParams.NO_DISPEL);
        return this;
    }

    noRemove() {
        this._buff.params.push(BuffParams.NO_REMOVE);
        return this;
    }

    stamp() {
        this._buff.params.push(BuffParams.STAMP);
        this._buff.params.push(BuffParams.NO_DISPEL);
        this._buff.params.push(BuffParams.NO_REMOVE);
        return this;
    }

    enchantment() {
        this._buff.params.push(BuffParams.ENCHANTMENT);
        this._buff.params.push(BuffParams.NO_DISPEL);
        this._buff.params.push(BuffParams.NO_REMOVE);
        return this;
    }

    fairyland() {
        this._buff.params.push(BuffParams.FAIRYLAND);
        this._buff.params.push(BuffParams.NO_DISPEL);
        this._buff.params.push(BuffParams.NO_REMOVE);
        return this;
    }


    countDown(num: number) {
        this._buff.countDown = num;
        this._buff.params.push(BuffParams.COUNT_DOWN);
        return this;
    }

    countDownBySource(num: number) {
        this._buff.countDown = num;
        this._buff.params.push(BuffParams.COUNT_DOWN_BY_SOURCE);
        return this;
    }

    name(name: string, maxCount?: number) {
        this._buff.name = name;
        if (typeof maxCount === 'number') this._buff.maxCount = maxCount;
        return this;
    }

    control(control: Control) {
        this._buff.control = control;
        this._buff.params.push(BuffParams.CONTROL);
        return this;
    }
    
    buff() {
        this._buff.params.push( BuffParams.BUFF);
        return this;
    }

    debuff() {
        this._buff.params.push( BuffParams.DEBUFF);
        return this;
    }

    buffAP(propertyName: string, effectType: EffectTypes, value: number) {
        this._buff.effect = {
            value,
            propertyName,
            effectType
        };
        this._buff.params.push(BuffParams.AFFECT_PROPERTY, BuffParams.BUFF);
        return this;
    }

    debuffAP(propertyName: string, effectType: EffectTypes, value: number) {
        this._buff.effect = {
            value,
            propertyName,
            effectType
        };
        this._buff.params.push(BuffParams.AFFECT_PROPERTY, BuffParams.DEBUFF);
        return this;
    }

    effect(propertyName: string, effectType: EffectTypes, value: number) {
        this._buff.effect = {
            value,
            propertyName,
            effectType
        };
        this._buff.params.push(BuffParams.AFFECT_PROPERTY);
        return this;
    }
    dependOn(buffIdOrEntityId: number, dependBuffName?: string) {
        if (typeof dependBuffName === 'string') {
            this._buff.dependEntityId = buffIdOrEntityId;
            this._buff.dependBuffName = dependBuffName;
            this._buff.params.push(BuffParams.DEPEND_ON);
        } else {
            this._buff.dependBuffId = buffIdOrEntityId;
            this._buff.params.push(BuffParams.DEPEND_ON);
        }

        return this;
    }

    ruleHighAndDry() {
        this._buff.params.push(BuffParams.RULE_HIGH_AND_DRY);
        return this;
    }
    ruleControlImmune() {
        this._buff.params.push(BuffParams.RULE_CONTROL_IMMUNE);
        return this;
    }
    end(): Buff {
        return this._buff;
    }
}

export default class Buff {
    name: string = ''; // buff名称 用于表示相同buff
    sourceId: number = 0; // 来源实体
    ownerId: number = 0;
    buffId: number;
    params: BuffParams[] = [];

    maxCount?: number; // 同名最大持有数量, 0表示无限制
    control?: Control; // 控制效果 flag:CONTROL
    countDown?: number; // 倒计时剩余回合 flag: COUNT_DOWN/COUNT_DOWN_BY_SOURCE
    shield?: number; // 护盾剩余吸收量 flag: SHIELD
    icon?: string; // 对应图标, 有效时显示 flag: VISIBLE
    effect?: Effect; // 对属性的影响 flag: AFFECT_PROPERTY
    dependBuffId?: number; // 依赖于别的buff的id，别的buff存在时有效，计算属性时有效

    dependEntityId?: number; // 依赖于别的buff，与dependBuffName组合生效，别的buff存在时有效，计算属性时有效
    dependBuffName?: string; // 依赖于别的buff，与dependBuffName组合生效，别的buff存在时有效，计算属性时有效

    probability?: number; // 概率, 大于0时有效 flag: SHOULD_COMPUTE_PROBABILITY

    constructor(sourceId: number, ownerId: number) {
        this.sourceId = sourceId;
        this.ownerId = ownerId;
        this.buffId = ++buffCounter;
    }

    hasParam(p: BuffParams){
        return this.params.includes(p);
    }

    static build(sourceId: number, ownerId: number): BuffBuilder {
        return new BuffBuilder(sourceId, ownerId);
    }
}

