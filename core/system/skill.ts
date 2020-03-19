import Handler from './handler';
import Game from './game';

export default interface Skill {
    no: number; // 技能编号
    handlers: Handler[]; // 其他handler
    passive: boolean; // 是否是被动
    text?: string;
    name?: string;

    check?(game: Game, entityId: number): boolean; // 是否能使用
    cost: ((game: Game, entityId: number) => number) | number;  // 支付代价
    use?(game: Game, sourceId: number, selectedId: number): boolean; // 实际效果
}
