import Attack, {AttackTargetInfo} from './attack';
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
    attack?: Attack;
    step1?: number;
    step2?: number;
    buff?: Buff;
    turnData?: TurnData;
    attackTargetInfo?: AttackTargetInfo;
    precent?: number;
    reason?: Reasons;
    teamId?: number;
    num?: number;
    no?: number;
    remainHp?: number;
    isDead?: boolean;
}

