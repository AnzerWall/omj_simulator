import { Game } from './game';
import { ShikigamiTest } from './shikigami/shikigami_test';
import { Team } from './team';
import { ShikigamiYamausagi } from './shikigami/shikigami_yamausagi';

const team1S1 = new ShikigamiTest('红方-式神1');
// const team1S2 = new ShikigamiTest('红方-式神2');

const team1 = new Team('红方');
team1.addMember(team1S1);
// team1.addMember(team1S2);

const team2S1 = new ShikigamiYamausagi('蓝方-山兔');
// const team2S2 = new ShikigamiTest('蓝方-式神2');

const team2 = new Team('蓝方');
team2.addMember(team2S1);
// team2.addMember(team2S2);

const game = new Game(team1, team2);

game.run();
