import {actions, ActorRef, assign, createMachine, MachineConfig, send, spawn} from "xstate";
import {EntityContext, EntitySm} from "./entity";
import {Runway, runwayAdd, runwayCompute, runwayGetNext, runwayNew, runwaySet} from "./runway";
import {NormalAttack} from "./skills/normal-attack";

const {pure, respond} = actions

export type GameContext = {
    entities: Array<ActorRef<any>>
    teams: [Array<number>, Array<number>]
    runway: Runway,
    turnInfo: {
        entityId: number
        [key: string]: any,
    }
}
export const GameQueries = {
    getEntity(game: GameContext, entityId: number): EntityContext | null {
        const ref: ActorRef<any> = game.entities[entityId]
        if (!ref) return null;

        return ref.getSnapshot().context;
    },
    getAliceTeamMembers(game: GameContext, teamId: number) {
        return game.teams[teamId]?.filter(entityId => {
            const entity = this.getEntity(game, entityId)
            return entity && entity.hp > 0
        }) ?? []
    },
    getAliveTeammates(game: GameContext, entityId: number) {
        const entity = this.getEntity(game, entityId)
        if (!entity) return [entityId]

        const teamId = entity.teamId
        return this.getAliceTeamMembers(game, teamId)
    },
    getAliveEnemies(game: GameContext, entityId: number) {
        const entity = this.getEntity(game, entityId)
        if (!entity) return [entityId]

        const teamId = entity.teamId
        return this.getAliceTeamMembers(game, 1 - teamId)
    },
}
export const entity = createMachine(EntitySm)

export function createSkill(data: {
    name: string
    config: Record<string, any>
}, owner: number) {
    switch (data.name) {
        case 'normal-attack':
            return createMachine(NormalAttack).withContext({
                config: data.config,
                owner,
                skillTarget: -1,
                meta: {}
            })
        default:
            return null
    }
}

export const GameSm: MachineConfig<GameContext, any, any> = {
    initial: 'init',
    context: {
        entities: [],
        teams: [[], []],
        runway: runwayNew(),
        turnInfo: {
            entityId: -1,
        },
    },
    states: {
        init: {
            on: {
                GAME_START: {
                    target: 'gaming',
                    actions: (context, event) => {
                        // console.log(context.entities.map(e => e.getSnapshot().context))
                        console.log("[队伍]", context.teams)
                    }
                },
                ADD_ENTITY: {
                    actions: [assign({
                        teams: (context, event) => {
                            const id = context.entities.length
                            if (event.data.teamId === 0) {
                                return [
                                    [...context.teams[0], id],
                                    context.teams[1]
                                ]
                            } else {
                                return [
                                    context.teams[0],
                                    [...context.teams[1], id],
                                ]
                            }
                        },
                        runway: (context, event) => {
                            const id = context.entities.length
                            return runwayAdd(context.runway, id)
                        },
                        entities: (context, event) => {
                            const name = `Entity-${context.entities.length}`
                            return [
                                ...context.entities,
                                spawn(entity.withContext({
                                    decisionFunction: 'selectNormalAttack',
                                    teamId: event.data.teamId,
                                    original: {
                                        ...event.data.properties
                                    },
                                    current: {
                                        ...event.data.properties
                                    },
                                    hp: event.data.properties.maxHp,
                                    skills: [],
                                }), {
                                    name,
                                    sync: false,
                                })
                            ]
                        },

                    }), pure((context: GameContext, event: any) => {
                        const id = context.entities.length - 1
                        const skills = event.data?.skills

                        return skills?.map((s: any) => {
                            const sm = createSkill(s, id)
                            if (sm) {
                                return send({type: 'ADD_SKILL', skillSM: sm}, {to: context.entities[id] as any})
                            }
                            return null
                        })?.filter(Boolean);
                    })]
                },
            }
        },
        gaming: {
            initial: 'init',
            states: {
                init: {
                    entry: assign({
                        runway: (context) => runwayCompute(context.runway, context.entities.reduce((table, e, id) => {
                            table[id] = e.getSnapshot().context.speed
                            return table;
                        }, {} as Record<string, number>))
                    }),
                    on: {
                        NEXT: 'advance'
                    }
                },
                advance: {
                    entry: (context) => {
                        console.log(context.runway)
                    },
                    on: {
                        NEXT: 'runway'
                    }
                },
                runway: {
                    entry: [assign({
                        runway: (context) => runwayCompute(context.runway, context.entities.reduce((table, e, id) => {
                            table[id] = e.getSnapshot().context.current.speed
                            return table;
                        }, {} as Record<string, number>)),
                    }), assign({
                        turnInfo: (context) => {
                            return {
                                entityId: runwayGetNext(context.runway)
                            }
                        },
                        runway: (context) => {
                            const id = context.turnInfo.entityId
                            if (id === -1) {
                                return context.runway
                            }
                            return runwaySet(context.runway, id, 0)
                        }
                    })],
                    on: {
                        NEXT: [
                            {target: 'win', cond: (context, event) => context.turnInfo.entityId < 0},
                            {target: 'turn'}
                        ]
                    }
                },
                turn: {
                    entry: (context) => {
                        console.log("[当前回合]", context.turnInfo.entityId, context.entities.map(e => e.getSnapshot().context.hp))
                    },
                    initial: 'init',
                    on: {
                        NEXT: [
                            {
                                target: 'win', cond: (context, event) => {
                                    return GameQueries.getAliceTeamMembers(context, 0).length <= 0 ||
                                        GameQueries.getAliceTeamMembers(context, 1).length <= 0
                                }

                            },
                            {target: 'runway'}
                        ]
                    },
                    states: {
                        init: {
                            on: {
                                NEXT: 'compute'
                            }
                        },
                        compute: {
                            entry: pure(((context, event) => {
                                const me = context.turnInfo.entityId
                                if (me === -1) return undefined
                                const target = GameQueries.getAliveEnemies(context, me)?.[0] ?? -1
                                if (target === -1) return undefined

                                return send({
                                    type: 'HURT',
                                    data: {
                                        targetId: target,
                                        value: -3000,
                                    }
                                })
                            })),
                            on: {
                                NEXT: 'end'
                            }
                        },
                        end: {
                            type: 'final' as any,
                        }
                    }
                },
                win: {
                    type: 'final' as any,
                }
            },
            on: {
                NEXT: 'end',
                GAME_END: 'end',
                // actions
                BROADCAST: {
                    actions: pure((context: GameContext, event: any) => {
                        return context.entities.map((entity) => {
                            return send(event.event, {to: entity as any});
                        })
                    })
                },
                HURT: {
                    actions: pure((context: GameContext, event: any) => {
                        const {targetId, value} = event.data
                        const ref = context.entities[targetId]

                        return [
                            send({
                                type: 'UPDATE_HP',
                                value,
                            }, {to: ref as any}) as any
                        ]
                    }),
                },

                // query
                COMPUTE_PROPERTY: {
                    actions: ((context, event) => {
                        return send({
                            type: 'BROADCAST',
                            event: {
                                type: 'COMPUTE_PROPERTY',
                            }
                        })
                    })
                }

            }
        },
        end: {
            type: 'final' as any,
        },
    }
}
