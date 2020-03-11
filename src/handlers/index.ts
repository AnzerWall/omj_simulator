import { build } from './phase-transfer';
import Codes from '../core/codes';
import OrdinaryMoveBarOrder from './ordinary-move-bar-order';

export const ordinaryStart = build(Codes.PHASE_START, Codes.PHASE_MOVE_BAR_ORDER); // 游戏开始  转移到开局行动条排序
export const ordinaryMoveBarOrder = new OrdinaryMoveBarOrder(); // 行动条排序 然后触发先机
export const ordinarySenki = build(Codes.PHASE_SENKI, Codes.PHASE_TURN_BEGIN); // 先机后进入第一回合

export const ordinaryMoveBar = build(Codes.PHASE_MOVE_BAR, Codes.PHASE_TURN_BEGIN);
export const ordinaryTurnBegin = build(Codes.PHASE_TURN_BEGIN, Codes.PHASE_ACTION);
export const ordinaryAction = build(Codes.PHASE_ACTION, Codes.PHASE_TURN_END);
export const ordinaryTurnEnd = build(Codes.PHASE_TURN_END, Codes.PHASE_MOVE_BAR);

