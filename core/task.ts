import {EventData} from './events';
import Battle from './battle';

export interface Processor {
    (battle: Battle, data: EventData, step: number): number | void;
}

export default interface Task {
    step: number;
    children: Task[]; // 任务队列
    processor: Processor;
    type: string;
    parent: Task | null;
    data: EventData;
    depth: number;
}

