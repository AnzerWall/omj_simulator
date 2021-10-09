import {Battle} from "../index";


export class UpdateRunWayProcessing{
    constructor(public sourceId: number, public targetId: number, public percent: number, public reason: number){}
}
export default function updateRunWayProcessor(battle: Battle, data: UpdateRunWayProcessing, _: number) {
    // if (!(data instanceof UpdateRunWayProcessing)) return 0;
    return battle.runway.updatePercent(data.targetId, data.percent) ? -1 : 0;
}