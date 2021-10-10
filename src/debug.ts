import { createMachine, interpret } from 'xstate';
import {GameSm} from "./game";


const game = interpret(createMachine(GameSm))
game.start()
game.onTransition(((state, event) => {
    console.log(`[状态变化] ${state.toStrings()}`, event.type)
}))

game.send({
    type: 'ADD_ENTITY',
    data: {
        teamId: 0,
        properties: {
            attack: 1500,
            defense: 1000,
            speed: 240,
            hp: 100,
            maxHp: 100,
        }
    }
})
game.send({
    type: 'ADD_ENTITY',
    data: {
        teamId: 1,
        properties: {
            attack: 1500,
            defense: 1000,
            speed: 120,
            hp: 100,
            maxHp: 100,
        }
    }
})
game.send("GAME_START")


for(let i = 0; i < 1000; i++) {
    if (game.state.done) break;

    game.send("NEXT")
}


game.stop()