export const enum Operator {
    ADD,
    SET,
    NOTHING,
}
export interface Effect {
    property_name: string; // 属性名
    op: Operator; // 操作
    value: number; // 值
}
export default interface Buff {
    can_dispel: boolean;  // 是否可驱散
    can_remove: boolean; // 是否可清除
    stamp: boolean; // 是否是印记
    name: string; // buff名称 用于表示相同buff
    maxCount: number; // 最大持有数量
    source_entity_id: number; // 来源实体

    // 倒计时buff
    countDown: number; // 倒计时剩余回合 -1 永久buff
    countDownBySource: boolean; // 倒计时剩余回合 -1 永久buff

    // 属性buff
    effects: Effect[]; // 对属性的影响

    enchantment: boolean; // 是否是结界buff

}

