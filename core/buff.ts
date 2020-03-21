import {BuffParams, Control} from './constant';

export const enum EffectTypes {
    FIXED, // 增加固定数值value
    SET,  // 设置为value
    ADD_RATE, // 增加倍率
    NOTHING, // 啥都不做
}

export interface Effect {
    propertyName: string; // 属性名
    value: number; // 值   | ((game: Game, ownerId: number)=> number)
    effectType: EffectTypes;
}
export class BuffBuilder {
    public _buff: Buff;
    constructor(sourceId: number) {
        this._buff = new Buff(sourceId);
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
        return this;
    }

    enchantment() {
        this._buff.params.push(BuffParams.ENCHANTMENT);
        return this;
    }

    fairyland() {
        this._buff.params.push(BuffParams.FAIRYLAND);
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

    buff(propertyName: string, effectType: EffectTypes, value: number) {
        this._buff.effect = {
            value,
            propertyName,
            effectType
        };
        this._buff.params.push(BuffParams.AFFECT_PROPERTY, BuffParams.BUFF);
        return this;
    }

    debuff(propertyName: string, effectType: EffectTypes, value: number) {
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


    end(): Buff {
        return this._buff;
    }
}

export default class Buff {
    name: string = ''; // buff名称 用于表示相同buff
    sourceId: number = 0; // 来源实体
    params: BuffParams[] = [];

    maxCount?: number; // 同名最大持有数量, 0表示无限制
    control?: Control; // 控制效果 flag:CONTROL
    countDown?: number; // 倒计时剩余回合 flag: COUNT_DOWN/COUNT_DOWN_BY_SOURCE
    shield?: number; // 护盾剩余吸收量 flag: SHIELD
    icon?: string; // 对应图标, 有效时显示 flag: VISIBLE
    effect?: Effect; // 对属性的影响 flag: AFFECT_PROPERTY
    probability?: number; // 概率, 大于0时有效 flag: SHOULD_COMPUTE_PROBABILITY

    constructor(sourceId: number) {
        this.sourceId = sourceId;
    }

    hasParam(p: BuffParams){
        return this.params.includes(p);
    }

    static build(sourceId: number): BuffBuilder {
        return new BuffBuilder(sourceId);
    }
}

