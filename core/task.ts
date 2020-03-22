import {EventData} from './events';
import Battle from './battle';


export interface Processor {
    (battle: Battle, data: EventData, step: number): number | void;
}

// 状态机树  节点
export default interface Task {
    step: number; // step === 0 出错 step < 0 任务结束 step > 0 任务进行到step阶段
    children: Task[]; // 子任务队列
    processor: Processor; // 处理器函数
    type: string; // 类型
    parent: Task | null; // 父亲任务
    data: EventData; // 任务数据
    depth: number; // 树深度
    taskId: number; // 任务id
}

/*
示例， （注：step不是真实代码处理时的step）
Battle step=3 回合处理阶段
    Turn step=4 技能处理阶段
        Skill step=2 攻击处理阶段
            Attack step = 5 结算阶段
                UpdateHp step = 1  生命处理
            Buff buff附加
 */
