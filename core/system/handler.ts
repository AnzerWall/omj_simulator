import Game from './game';

export default interface Handler {
    handle(game: Game, entity_id: number): boolean; // 执行
    event: number; // 触发事件
    event_range: number; // 事件范围
}
