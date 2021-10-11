import {ActorRef, assign, MachineConfig, spawn} from "xstate";
import {DecisionFunction, SkillConfig} from "@/skills/skill";

export interface Properties {
    attack: number // 攻击
    defense: number // 防御
    speed: number // 速度
    maxHp: number // 最大生命

    // criticalProbability: number // 暴击率
    // criticalRate: number // 暴击伤害
    // antiCriticalProbability: number // 暴击抵抗
    // hitRate: number // 效果命中
    // antiHitRate: number // 效果抵抗
    //
    // healingDown: number // 减疗
    // healingUp: number // 治疗增加
    //
    // lifeSteal: number // 吸血
    //
    // damageDealtUp: number // 造成伤害增加
    // damageDealtDown: number // 造成伤害减少
    //
    // damageTakenUp: number // 受到伤害增加
    // damageTakenDown: number // 受到伤害减少
}
export interface EntityContext{
    original: Properties
    current: Properties
    skills: Array<ActorRef<any>>
    hp: number
    teamId: number // 队伍id
    decisionFunction: string // 决策函数
}

export interface EntityConfig {
    name: string
    properties: Properties
    skills: SkillConfig[]
    decisionFunction: string // 决策函数
}

export const EntitySm: MachineConfig<EntityContext, any, any>  = {
    initial: 'init',
    context: {
        original: {
            attack: 0,
            defense: 0,
            speed: 0,
            maxHp: 1,
        },
        current: {
            attack: 0,
            defense: 0,
            speed: 0,
            maxHp: 1,
        },
        hp: 1,
        teamId: -1,
        skills: [],
        decisionFunction: 'manual'
    },
    states: {
        init: {
            on: {
                ADD_SKILL: {
                    actions: assign({
                        skills: (context, event) => {
                            return [
                                ...context.skills,
                                spawn(event.skillSM, { autoForward: true }) as ActorRef<any>
                            ]
                        }
                    })
                },
                RESET_CURRENT_PROPERTIES: {
                    actions: assign({
                        current: (context) => {
                            return {
                                ...context.original,
                            }
                        }
                    })
                },
                UPDATE_HP: {
                    actions: assign({
                        hp: (context, event) => Math.max(context.hp + event.value, 0)
                    })
                }
            }
        }
    }
}
