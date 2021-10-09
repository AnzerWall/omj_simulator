import {Processor} from '../task';
import {Battle, Control, EventCodes} from '../index';

export class FakeTurnProcessing {
    cannotAction: boolean = false;
    onlyAttack: number = 0;
    confusion: boolean = false;
    constructor(public processor: Processor,
    public data: any, public currentId: number){}
}

export default function fakeTurnProcessor(battle: Battle, data: FakeTurnProcessing, step: number): number {
    const currentEntity = battle.getEntity(data.currentId);

    switch (step) {
        // 开始阶段
        case 1: {
            data.cannotAction = battle.hasBuffByControl(
                currentEntity.entityId,
                Control.DIZZY,
                Control.SLEEP,
                Control.FROZEN,
                Control.POLYMORPH,
            );
            data.confusion = battle.hasBuffByControl(currentEntity.entityId, Control.CONFUSION);
            battle.filterBuffByControl(currentEntity.entityId, Control.PROVOKE, Control.SNEER).forEach(buff => {
                data.onlyAttack = buff.sourceId;
            });
            if (currentEntity.dead) return -1;

            battle.log(`伪回合 ${currentEntity.name}(${currentEntity.teamId})`);
            battle.addEventProcessor(EventCodes.ACTION_START, currentEntity.entityId, data);
            return 2;
        }
        // 回合内
        case 2: {
            if (data.cannotAction) return 3;
            battle.addProcessor(data.processor, data, `伪回合${currentEntity.name}`);
            return 3;
        }
        // 回合结束
        case 3: {
            battle.addEventProcessor(EventCodes.ACTION_END, currentEntity.entityId, data);
            return -1;
        }
    }
    return 0
}
