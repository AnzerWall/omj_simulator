import {Battle, EventCodes, EventData, TurnData} from '../';
import turnProcessor from './turn';

export default function battleProcessor(battle: Battle, _: EventData, step: number): number {
    switch (step) {
        case 1: {
            battle.addEventProcessor(EventCodes.BATTLE_START, 0);
            return 2;
        }
        case 2: {
            battle.runway.compute();
            battle.addEventProcessor(EventCodes.SENKI, 0);
            return 3;
        }
        case 3: {
            battle.judgeWin();
            if (battle.isEnd) return -1;
            const nextId = battle.runway.computeNext() || 0;
            if (!nextId) return -1;

            const next = battle.getEntity(nextId);
            if (battle.turn >= 1000) return 0; // 超时

            const turnData = new TurnData(++battle.turn, next.entityId);

            battle.addProcessor(turnProcessor, {turnData}, 'Turn');
            return 3;
        }
        default:
            return 0;
    }
}
