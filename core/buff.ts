import {Control} from './constant';

export const enum Operator {
    ADD, // 增加value
    SET,  // 设置为value
    RATE, // 增加 base * rate
    NOTHING, // 啥都不做
}

export interface Effect {
    propertyName: string; // 属性名
    op: Operator; // 操作
    value: number; // 值   | ((game: Game, ownerId: number)=> number)
}

export default class Buff {
    canDispel: boolean = false;  // 是否可驱散
    canRemove: boolean = false; // 是否可清除
    isStamp: boolean = false; // 是否是印记
    name: string = ''; // buff名称 用于表示相同buff
    maxCount: number = 0; // 同名最大持有数量
    sourceId: number = 0; // 来源实体

    // 倒计时buff
    countDown: number = 0; // 倒计时剩余回合 -1 永久buff
    countDownBySource: boolean = false;

    // 属性buff
    effects: Effect[] = []; // 对属性的影响

    // 是否是结界
    enchantment: boolean = false;

    // 是否可见
    visible: boolean = false;

    // 控制效果
    control: Control = Control.NONE;

    // 对应图标
    icon: string = '';

    // 【增益, 状态】
    // 是否是增益
    isBuff: boolean = false;
    // 是否是减益
    isDebuff: boolean = false;
    // 状态, 是否影响属性
    isAffectProperty: boolean = false;

    isHit: boolean | undefined;
    isRes: boolean | undefined;
    pass: boolean | undefined;

    constructor(sourceId: number) {
        this.sourceId = sourceId;
    }
}

