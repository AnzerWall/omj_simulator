export class Energy {
    value: number = 4; // 当前鬼火数量
    maxValue: number = 8; // 最大鬼火数量
    progress: number = 0; // 鬼火进度条
    // 增加鬼火   //TODO: 这垃圾的命名该改一改
    get(count: number): void {
        this.value = Math.min(this.value + count, this.maxValue);
    }
    // 消耗鬼火
    cost(count: number): void {
        this.value = Math.max(this.value - count, 0);
    }
    // 是否足够消耗鬼火
    canCost(count: number): boolean {
        return this.value >= count;
    }
    // 推进鬼火进度条
    growProgress(count: number = 1): void {
        const sum = count + this.progress;

        this.progress = sum % 8;
        this.get(Math.floor(sum / 8));
    }
}
