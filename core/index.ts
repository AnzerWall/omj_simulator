import Game from './ordinary-game';
import teamIds from './fixtures/team_ids';
import { Entity } from './system/entity';
import { Heros } from './heroes';
import { sampleSize } from 'lodash';

const entities: Entity[] = [];
[ teamIds.TEAM1, teamIds.TEAM2 ].forEach(team_id => {
    const keys = sampleSize(Object.keys(Heros), 5); // 为每个队伍分配5个队员
    for (const key of keys) {
        const hero = new Heros[key]();
        hero.setTeam(team_id);
        entities.push(hero);
    }
});

console.log(entities);

const game = new Game(entities);
game.run();

