export default class Mana {
    public num: number; // 当前鬼火数量
    public progress: number; // 鬼火进度条
    private readonly initNum: number;
    constructor(initNum: number) {
        this.initNum = initNum;
        this.num = initNum;
        this.progress = 0;
    }

    reset() {
        this.num = this.initNum;
        this.progress = 0;
    }
}
