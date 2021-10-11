import {GameContext} from "@/game";
import {EntityContext} from "@/entity";

export interface SkillConfig {
    name: string
    config: Record<string, any>
}
export interface SkillContext {
    name: string
    isNormalAttack: boolean
    config: Record<string, any>
}
export interface SkillSelection {
    skill: SkillContext
    targetId: number
}
export type DecisionFunction = (game: GameContext, source: EntityContext, skills: SkillContext[]) => SkillSelection| null
