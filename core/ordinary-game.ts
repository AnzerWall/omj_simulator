import Game from './system/game';
function sleep(ms: number): void {
    const current = Date.now();

    while (Date.now() - current < ms);
}
export default class OrdinaryGame extends Game {
    run() {
        while (this.next_step()) {
            sleep(100);
        }
    }
}
