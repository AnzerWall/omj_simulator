import Handler from './handler';
import Game from './game';

export default interface Skill {
    no: number; // 技能编号
    handlers: Handler[]; // 其他handler
    passive: boolean; // 是否是被动
    text?: string;
    check?(game: Game, entity_id: number): boolean; // 是否能使用
    cost: ((game: Game, entity_id: number)=> number)| number;  // 支付代价
    use?(game: Game, source_entity_id: number, selected_entity_id: number): boolean; // 实际效果
}
