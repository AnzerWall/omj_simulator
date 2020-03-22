import {Battle, EventData,EventCodes } from "../index";

export default function removeBuffProcessor(battle: Battle, data: EventData, step: number) {
    const {removeBuffProcessing } = data;
    if (!removeBuffProcessing) return 0;
    const buff = removeBuffProcessing.buff;

    const index = battle.buffs.indexOf(buff);
    if (index === -1) return -1;
    switch (step) {
        case 1: {
            battle.addEventProcessor(EventCodes.BEFORE_BUFF_REMOVE, buff.ownerId, {removeBuffProcessing});
            return 2;
        }
        case 2: {
            battle.buffs.splice(index, 1);

            battle.addEventProcessor(EventCodes.BUFF_REMOVE, buff.ownerId, {removeBuffProcessing});
            return -1;
        }
    }
    return 0;
}