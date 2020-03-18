export const enum Operator {
    ADD,
    SET,
    NOTHING,
}

export interface Effect {
    propertyName: string; // 属性名
    op: Operator; // 操作
    value: number; // 值
}

export default interface Buff {
    canDispel: boolean;  // 是否可驱散
    canRemove: boolean; // 是否可清除
    isStamp: boolean; // 是否是印记
    name: string; // buff名称 用于表示相同buff
    maxCount: number; // 最大持有数量
    sourceId: number; // 来源实体

    // 倒计时buff
    countDown: number; // 倒计时剩余回合 -1 永久buff
    countDownBySource: boolean; // 倒计时剩余回合 -1 永久buff

    // 属性buff
    effects: Effect[]; // 对属性的影响

    // 是否是结界
    enchantment: boolean;


}

