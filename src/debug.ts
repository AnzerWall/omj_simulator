import { createMachine, interpret } from 'xstate';
import {GameSm} from "./game";
import {getTemplate} from "./shikigami";


const game = interpret(createMachine(GameSm))
game.start()
game.onTransition(((state, event) => {
    console.log(`[状态变化] ${state.toStrings()}`, event.type)
}))

game.send({
    type: 'ADD_ENTITY',
    data: {
        teamId: 0,
        ...getTemplate('normal'),
    }
})
game.send({
    type: 'ADD_ENTITY',
    data: {
        teamId: 1,
        ...getTemplate('normal'),
    }
})
game.send("GAME_START")


for(let i = 0; i < 100; i++) {
    if (game.state.done) break;

    game.send("NEXT")
}


game.stop()
