import Game from './ordinary-game';
import datas from './fixtures/heros.json';
import {sampleSize, map, filter} from 'lodash';

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
    entities[0].no = 405;
});

const game = new Game(entities);
game.run();

