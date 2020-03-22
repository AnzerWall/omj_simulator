import {Battle, Reasons} from "../index";


export class UpdateManaProgressProcessing {
    constructor(public sourceId: number,public teamId: number,
                public num: number, reason: Reasons = Reasons.NOTHING){}
}

export default function updateManaProgreassProcessor(battle: Battle, data: UpdateManaProgressProcessing, _: number): number  {
    // TODO: 追月神用的事件
    const mana = battle.manas[data.teamId];
    if (!mana) return 0;
    // battle.log(mana);
    // battle.log(data);
    mana.progress = mana.progress + data.num;
    if (mana.progress < 0) mana.progress = 0;
    if (mana.progress > 5) mana.progress = 5;
    return -1;
}