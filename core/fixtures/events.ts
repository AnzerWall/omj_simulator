import Attack from '../system/attack';
import Buff from '../system/buff';

export enum EventCodes {
    NONE,
    GAME_START, // 游戏开始
    SENKI, // 先机
    TURN_START, // 回合开始
    ACTION_START, // 动作开始
    ACTION_END, // 动作结束后
    TURN_END, // 回合结束后
    DAMAGE, // 造成伤害后
    ATTACK, // 攻击后
    TAKEN_SELECT, // 被选中后
    TAKEN_DAMAGE, // 受到伤害后
    TAKEN_ATTACK, // 受到攻击后
    BUFF_GET, // 获得buff后
    BUFF_REMOVE, // 移除buff后
    KILL, // 击杀后
    NO_KILL, // 未击杀后
    DEAD, // 死亡后
    CONTROL, // 附加控制效果后
    WILL_TAKEN_CONTROL, // 将要附加控制效果
    TAKEN_CONTROL, // 受到控制效果后
    MANA_OVERFLOW, // 鬼火溢出
    MANA_CHANGE, // 鬼火变化
    SKILL, // 使用技能
    UPDATE_HP, // 生命变化时
    BEFORE_ATTACK, // 攻击处理前修改攻击对象
    CRI, // 暴击时

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
    targetId?: number;
    skillOwnerId?: number;
    skillNo?: number;
    attack?: Attack;
    step1?: number;
    step2?: number;
    buff?: Buff;
}

