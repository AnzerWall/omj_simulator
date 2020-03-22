import {AttackInfo} from './attack';
import Buff from './buff';
import TurnData from './turn-data';
import {Reasons} from './constant';

export class AddBuffProcessing {
    isHit: boolean = false;
    isRes: boolean = false; // 是否抵抗
    cancel: boolean = false;


    constructor(public buff: Buff, public reason: Reasons) {

    }
}
export class RemoveBuffProcessing {

    constructor(public buff: Buff, public reason: Reasons) {

    }
}
export enum EventRange {
    NONE,
    SELF,
    TEAM,
    ENEMY,
}

export interface EventData {
    sourceId?: number;
    targetId?: number;
    selectedId?: number;


    skillOwnerId?: number;
    skillNo?: number;


    attackInfo?: AttackInfo;
    attackInfos?: AttackInfo[];
    removeBuffProcessing? : RemoveBuffProcessing;
    addBuffProcessing? : AddBuffProcessing;

    turnData?: TurnData;
    percent?: number;
    reason?: Reasons;
    teamId?: number;
    num?: number;
    no?: number;
    remainHp?: number;
    isDead?: boolean;
}

