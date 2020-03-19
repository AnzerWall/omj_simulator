import {EventData} from '../fixtures/events';
import Game from './game';


export interface Processor {
    (game: Game, data: EventData, step: number): number | void;
}

export default interface Task {
    step: number;
    children: Task[]; // 任务队列
    processor: Processor;
    type: string;
    parent: Task | null;
    data: EventData,
    depth: number;
}

