import turnProcessor, {TurnProcessing} from './turn';
import {Battle, EventCodes} from "../";
import fakeTurnProcessor from './fake-turn';


export default function battleProcessor(battle: Battle, _: any, step: number): number {
    switch (step) {
        case 1: {
            battle.addEventProcessor(EventCodes.BATTLE_START, 0, _);
            return 2;
        }
        case 2: {
            battle.runway.compute();
            battle.addEventProcessor(EventCodes.SENKI, 0, _);
            return 3;
        }
        case 3: {
            battle.judgeWin();
            if (battle.isEnd) return -1;
            battle.entities.forEach(e => e.turnData.clear()); // 清理回合临时数据
            const nextId = battle.runway.computeNext() || 0;
            if (!nextId) return -1;

            const next = battle.getEntity(nextId);
            if (battle.turn >= 1000) return 0; // 超时

            const turnData = new TurnProcessing(++battle.turn, next.entityId);

            battle.addProcessor(turnProcessor, turnData, 'Turn');
            return 4;
        }
        case 4: {
            if (battle.fakeTurns.length) {
                battle.fakeTurns.forEach(ft => battle.addProcessor(fakeTurnProcessor, ft, '伪回合处理'))
            }
            return 3;
        }
        default:
            return 0;
    }
}
