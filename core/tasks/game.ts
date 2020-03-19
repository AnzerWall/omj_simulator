import {Game} from '../system';
import {EventCodes, EventData} from '../fixtures/events';
import { turnProcessor } from './index';
import TurnData from '../system/turn-data';

export default function gameProcessor(game: Game, data: EventData, step: number): number {
    switch (step) {
        case 1: {
            game.dispatch(EventCodes.GAME_START);
            return 2;
        }
        case 2: {
            game.runway.compute();
            game.dispatch(EventCodes.SENKI);
            return 3;
        }
        case 3: {
            game.judgeWin();
            if (game.isEnd) return -1;
            const next = game.getEntity(game.runway.computeNext() || 0);
            if (!next) return 0;
            if (game.turn >= 1000) return 0; // 超时

            const turnData = new TurnData(++game.turn, next.entityId);


            game.addProcessor(turnProcessor, { turnData }, 'Turn');
            return 3;
        }
        default:
            return 0;
    }
}
