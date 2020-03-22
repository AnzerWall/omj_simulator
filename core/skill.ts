import Handler from './handler';
import Battle from './battle';

export default interface Skill {
    no: number; // 技能编号
    name: string;
    cost: ((battle: Battle, entityId: number) => number) | number;  // 支付代价

    handlers?: Handler[]; // 其他handler
    passive?: boolean; // 是否是被动
    text?: string; // 技能描述
    check?(battle: Battle, entityId: number): boolean; // 是否能使用
    use?(battle: Battle, sourceId: number, selectedId: number): boolean; // 实际效果
}
