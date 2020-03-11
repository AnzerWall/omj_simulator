enum Codes {
    EMPTY,
    PHASE_START, // 游戏开局
    PHASE_MOVE_BAR_ORDER, // 开局行动条计算
    PHASE_SENKI, // 先机
    PHASE_MOVE_BAR, // 行动条计算
    PHASE_TURN_BEGIN, // 回合开始
    PHASE_ACTION, // 回合决策
    PHASE_TURN_END, // 回合结束
}

export default Codes;
