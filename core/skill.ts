import Handler from './handler';
import Battle from './battle';
export enum SkillTarget {
    ENEMY,
    TEAM,
    SELF,
}
export default interface Skill {
    no: number; // 技能编号
    name: string;
    cost: ((battle: Battle, entityId: number) => number) | number;  // 支付代价
    hide?: boolean;
    handlers?: Handler[]; // 其他handler
    passive?: boolean; // 是否是被动
    text?: string; // 技能描述
    target?: ((battle: Battle, entityId: number) => number[]) |SkillTarget; // 是否能使用
    use?: (battle: Battle, sourceId: number, selectedId: number) => number | void; // 实际效果
}

export interface SelectableSkill {
    no: number;
    targets: number[];
    cost: number;
}

export interface SkillSelection {
    no: number;
    targetId: number;
}
