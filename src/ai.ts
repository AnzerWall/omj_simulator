import {DecisionFunction, SkillContext, SkillSelection} from "./skills/skill";
import {GameContext, GameQueries} from "./game";
import {EntityConfig, EntityContext} from "./entity";
import { sample } from "lodash";

/**
 * AI: 攻击随机敌方目标
 */


export const AITable: Record<string, DecisionFunction> = {
    selectNormalAttack (game: GameContext, source: EntityContext, skills: SkillContext[]): SkillSelection | null {
        for (const s of skills) {
            if (s.isNormalAttack) {
                const enemies = GameQueries.getAliveEnemies(game, source.teamId)
                if (enemies.length < 0) {
                    return null;
                }
                return {
                    skill: s,
                    targetId: sample(GameQueries.getAliveEnemies(game, source.teamId)) as number
                }
            }
        }
        return null
    }
}
export function getAI(name: string, config: Record<string, any> = {}): DecisionFunction | undefined {
    return AITable[name]
}
