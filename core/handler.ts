import {Processor} from './task';
import {EventCodes, EventRange} from './constant';

export default interface Handler {
    handle: Processor; // 执行
    code: EventCodes; // 触发事件
    range: EventRange; // 事件范围
    priority: number; // 优先级
    passiveOrEquipment: boolean; // 是否是写在被动里的
    name: string;
}
