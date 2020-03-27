import {Handler} from './index';

export default interface Equipment  {
    no: number;
    name: string;
    handlers?: Handler[]; // 其他handler
    text?: string; // 描述
}
