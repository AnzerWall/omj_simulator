import {MachineConfig} from "xstate";


type EntityContext = {
    attack: number
    defense: number
    speed: number
    hp: number
    maxHp: number
    teamId: number,
}

export const EntitySm: MachineConfig<EntityContext, any, any>  = {
    initial: 'alive',
    context: {
        attack: 0,
        defense: 0,
        speed: 0,
        hp: 1,
        maxHp: 1,
        teamId: -1,
    },
    states: {
        alive: {
            on: {

            }
        }
    }
}