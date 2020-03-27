import {Battle, BuffParams, EventCodes, Reasons} from "../index";
import Buff from "../buff";
export class RemoveBuffProcessing {
    constructor(public buff: Buff, public reason: Reasons) {

    }
}
export default function removeBuffProcessor(battle: Battle, data: RemoveBuffProcessing, step: number) {

    const buff = data.buff;

    const index = battle.buffs.indexOf(buff);
    if (index === -1) return -1;
    switch (step) {
        case 1: {
            battle.addEventProcessor(EventCodes.BEFORE_BUFF_REMOVE, buff.ownerId, data);
            return 2;
        }
        case 2: {
            const target = buff.ownerId > 0? battle.getEntity(buff.ownerId) : null;
            battle.log(
                target ? `【${target.name}(${target.teamId})】` : '全局',
                `失去 【${buff.name}】 Buff`);
            battle.buffs.splice(index, 1);

            battle.addEventProcessor(EventCodes.BUFF_REMOVE, buff.ownerId, data);
            return -1;
        }
    }
    return 0;
}
