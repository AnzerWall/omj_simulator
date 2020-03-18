import Game from './game';
import {EventRange, EventCodes, EventData} from '../fixtures/events';

export default interface Handler {
    handle(game: Game, data: EventData): boolean; // 执行
    code: EventCodes; // 触发事件
    range: EventRange; // 事件范围
    priority: number; // 优先级
}
