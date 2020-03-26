import {Battle, Control, EventCodes, Handler} from "../";

export class EventData {
    constructor(public skillOwnerId: number,
    public skillNo: number,
    public eventId: number,
    public handler: Handler,
    public data: any){}

}

export class EventProcessing {
    units: EventData[] = [];
    constructor(public code: EventCodes){}
}

export default function eventProcessing(battle: Battle, data: EventProcessing, step: number): number  {
    // if (!(data instanceof EventProcessing)) return 0;
    if (step <= 0) return 0;

    const units = data.units;
    if (step > units.length) return -1;
    const eventData = units[step - 1];
    if (!eventData) return 0;
    if (!eventData.handler) return 0;

    const entity = battle.getEntity(eventData.skillOwnerId);
    if (eventData.handler.passiveOrEquipment && battle.hasBuffByControl(eventData.skillOwnerId, Control.PASSIVE_FORBID)) return step + 1; // 被封印被动跳过处理

    battle.log(`${entity.name}(${entity.entityId})的${eventData.skillNo}技能事件触发`);
    battle.addProcessor(eventData.handler.handle,  eventData, `EventProcess`);

    return step + 1;
}