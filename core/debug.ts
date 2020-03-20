import datas from './fixtures/heros.json';
import {sampleSize, map, filter} from 'lodash';
import Game from './game';

function sleep(ms: number): void {
    const current = Date.now();

    while (Date.now() - current < ms) ;
}

class OrdinaryGame extends Game {
    run() {
        while (this.process()) {
            sleep(100);
        }
        console.log('游戏结束， 胜利者为队伍: ', this.winner);
    }
}

const ids = filter(map(datas, 'id'), d => !!d);
const entities: any[] = [];
[0, 1].forEach(team_id => {

    const keys = sampleSize(ids, 5); // 为每个队伍分配5个队员

    for (const id of keys) {
        entities.push({
            no: id,
            teamId: team_id,
        });
    }
});

const game = new OrdinaryGame(entities);
game.run();

