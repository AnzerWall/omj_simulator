export default class Mana {
    public num: number; // 当前鬼火数量
    public progress: number; // 鬼火进度条
    constructor(initNum: number) {
        this.num = initNum;
        this.progress = 0;
    }
}
