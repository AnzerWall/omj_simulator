import {EventCodes, Reasons} from "../constant";
import {Battle} from "../index";

export class UpdateNanaProcessing {
    constructor(public sourceId: number, public teamId: number, public num: number, public reason: Reasons = Reasons.NOTHING) {
    }
}

export default function updateManaProcessor(battle: Battle, data: UpdateNanaProcessing, _: number) {
    const mana = battle.manas[data.teamId];
    if (!mana) return 0;
    // battle.log(mana);
    // battle.log(data);

    mana.num = mana.num + data.num;
    if (mana.num < 0) return 0;
    if (mana.num > 8) {
        mana.num = 8;
        battle.addEventProcessor(EventCodes.MANA_OVERFLOW, 0, data);
    }
    return -1;
}