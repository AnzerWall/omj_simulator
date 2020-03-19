import Game from './game';
import {EventRange, EventCodes, EventData} from '../fixtures/events';
import {Processor} from './task';

export default interface Handler {
    handle: Processor; // 执行
    code: EventCodes; // 触发事件
    range: EventRange; // 事件范围
    priority: number; // 优先级
}
