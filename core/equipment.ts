export default interface Equipment  {
    name: string;
    handlers?: Handler[]; // 其他handler
    text?: string; // 描述
};