import {assign, MachineConfig, actions, send, sendParent} from "xstate";
import {GameContext, GameQueries} from "../game";
const {pure} = actions

// 攻击两次, 每次造成攻击*config.rate点伤害
export const NormalAttack: MachineConfig<any, any, any> = {
    initial: 'init',
    context: {
        config: {
            rate: 1.2,
            count: 1,
        },
        owner: 0,
        skillTarget: -1,
        meta: {
            remainCount: 1,
        },
    },
    states: {
        init: {
            on: {
                USE: {
                    target: 'using',
                    actions: assign({
                        skillTarget: (context: { skillTarget : number }, event: { skillTarget : number }) => event.skillTarget,
                    })
                }

            }
        },
        using: {
            initial: 'init',
            states: {
                // 初始化， 清理数据
                init: {
                    entry: assign({
                        meta: (context, event) => ({
                            ...context.meta,
                            remainCount: context.config.count
                        })
                    }),
                    on: {
                        NEXT: 'createAttack'
                    }
                },
                // 开始攻击，攻击目标2次
                createAttack: {
                    on: {
                        NEXT: [
                            {
                                target: 'attack',
                                cond: context => context.meta.remainCount > 0
                            },
                            {target: 'end'}
                        ]
                    }
                },
                // 攻击目标
                attack: {
                    entry: assign({
                        meta:  (context) => ({
                                ...context.meta,
                                remainCount: context.meta.remainCount - 1
                        }), // 剩余攻击次数-1
                    }),
                    on: {
                        NEXT: 'hurtCompute'
                    }
                },
                // 结算
                hurtCompute: {
                    entry: (context, event) => {
                        const game: GameContext = event.game
                        const entity = GameQueries.getEntity(game, context.owner)
                        return sendParent({
                            type: "HURT",
                            data: {
                                sourceId: context.owner,
                                targetId: context.skillTarget,
                                value: entity?.current.attack ?? 0
                            }
                        })
                    },
                    on: {
                        NEXT: 'createAttack'

                    }
                },
                end: {
                    type: 'final' as any,
                }
            }
        }
    }
}
