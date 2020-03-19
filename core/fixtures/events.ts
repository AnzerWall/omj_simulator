import Attack, {AttackTargetInfo} from '../system/attack';
import Buff from '../system/buff';
import TurnData from '../system/turn-data';
import {Reasons} from './reasons';

export enum EventCodes {
    NONE,
    GAME_START, // 游戏开始
    SENKI, // 先机
    TURN_START, // 回合开始后
    ACTION_START, // 行动开始
    ACTION_END, // 行动结束后
    TURN_END, // 回合结束后
    DAMAGE, // 造成伤害后
    ATTACK, // 攻击后
    TAKEN_SELECT, // 被选中后
    TAKEN_DAMAGE, // 受到伤害后
    TAKEN_ATTACK, // 受到攻击后
    BUFF_GET, // 获得buff后
    BUFF_REMOVE, // 移除buff后
    BEFORE_BUFF_GET, // 将要获得buff
    BEFORE_BUFF_REMOVE, // 将要移除buff
    KILL, // 击杀后
    NO_KILL, // 未击杀后
    DEAD, // 死亡后
    CONTROL_RES, // 抵抗后
    MANA_OVERFLOW, // 鬼火溢出后
    MANA_CHANGE, // 鬼火变化后
    SKILL, // 使用技能后
    UPDATE_HP, // 生命变化后
    BEFORE_ATTACK, // 攻击处理前
    CRI, // 暴击后

}

export enum EventRange {
    NONE,
    SELF,
    TEAM,
    ENEMY,
    ALL,
}

export interface EventData {
    eventId?: number;
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

