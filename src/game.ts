import {ActorRef, assign, createMachine, EventObject, MachineConfig, send, spawn, actions} from "xstate";
import {EntitySm} from "./entity";
import {Runway, runwayAdd, runwayCompute, runwayGetNext, runwayNew, runwaySet} from "./runway";

const {pure, respond} = actions

type GameContext = {
    entities: Array<ActorRef<any>>
    teams: [Array<number>, Array<number>]
    runway: Runway,
    turnInfo: {
        entityId: number
        [key: string]: any,
    }
}
export const entity = createMachine(EntitySm)

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
                    actions: assign({
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
                                    teamId: event.data.teamId,
                                    ...event.data.properties,
                                }),  {
                                    name,
                                    sync: true,
                                })
                            ]
                        },

                    })
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
                            table[id] = e.getSnapshot().context.speed
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
                        NEXT: 'turn'
                    }
                },
                turn: {
                    entry: (context) => {
                      console.log("[当前回合]", context.turnInfo.entityId)
                    },
                    initial: 'init',
                    on: {
                        NEXT: 'runway'
                    },
                    states: {
                        init: {

                        },
                        selectSkill: {},
                        waitingSelection: {},
                        selectTarget: {},
                        waitingSelectTarget: {},
                        compute: {},
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

                // query

            }
        },
        end: {
            type: 'final' as any,
        },
    }
}