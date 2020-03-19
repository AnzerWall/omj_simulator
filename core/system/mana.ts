export default class Mana {
    num: number; // 当前鬼火数量
    progress: number; // 鬼火进度条
    preProgress: number; // 每次恢复多少

    initNum: number; // 初始数量

    constructor(initNum: number) {
        this.initNum = initNum;
        this.num = initNum;
        this.progress = 0;
        this.preProgress = 5;
    }
    //
    // reset() {
    //     this.num = this.initNum;
    //     this.progress = 0;
    // }
    //
    // canCost(count: number) {
    //     return count <= this.num;
    // }
    //
    // cost(count: number) {
    //     if (!this.canCost(count)) return false;
    //
    //     this.num = Math.max(0, this.num - count);
    //     return true;
    // }
    //

}
