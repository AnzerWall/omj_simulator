import Game from './system/game';
function sleep(ms: number): void {
    const current = Date.now();

    while (Date.now() - current < ms);
}
export default class OrdinaryGame extends Game {
    run() {
        while (this.process()) {
            sleep(10);
        }
        console.log('游戏结束， 胜利者为队伍: ', this.winner);
    }
}
