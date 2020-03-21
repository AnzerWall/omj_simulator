import {AttackInfo} from './attack';
import Buff from './buff';
import TurnData from './turn-data';
import {Reasons} from './constant';

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

    buff?: Buff;
    turnData?: TurnData;
    percent?: number;
    reason?: Reasons;
    teamId?: number;
    num?: number;
    no?: number;
    remainHp?: number;
    isDead?: boolean;
}

