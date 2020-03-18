export default interface Buff {
    can_dispel: boolean;  // 是否可驱散
    can_remove: boolean; // 是否可清除
    stamp: boolean; // 是否是印记
    name: string; // buff名称
    maxCount: number; // 最大持有数量
    source_entity_id: number; // 来源实体
    owner_entity_id: number; // 持有实体
    countDown: number; // 倒计时
    countDownBySource: boolean; // 是否是维持型buff
}
