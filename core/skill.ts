import Handler from './handler';
import Game from './game';

export default interface Skill {
    no: number; // 技能编号
    name: string;
    cost: ((game: Game, entityId: number) => number) | number;  // 支付代价

    handlers?: Handler[]; // 其他handler
    passiveHandlers?: Handler[]; // 其他handler
    passive?: boolean; // 是否是被动
    text?: string; // 技能描述
    check?(game: Game, entityId: number): boolean; // 是否能使用
    use?(game: Game, sourceId: number, selectedId: number): boolean; // 实际效果
}
