import Game from '../system/game';
import {sample} from 'lodash';

export const phaseGameStart = (game: Game, _: object): boolean => {
    game.runway.compute();
    game.enqueueTask(phaseSenki, {}, '先机'); // 进入先机阶段
    return true;
};

export const phaseSenki = (game: Game, _: object): boolean => {
    // TODO: 处理先机
    game.current_entity = game.runway.getNext() || 0;
    game.turn++;
    game.enqueueTask(phaseTurn, {}, '新回合'); // 进入先机阶段
    return true;
};

export const phaseRunWay = (game: Game, _: object): boolean => {
    game.judgeWin();
    if (game.isEnd) return false;

    game.current_entity = game.runway.computeNext() || 0;
    game.turn++;

    game.enqueueTask(phaseTurn, {}, '新回合');
    return true;
};

export const phaseTurn = (game: Game, _: object): boolean => {
    if (!game.current_entity) return false; // 当前无下一个玩家

    const currentEntity = game.getEntity(game.current_entity);
    if (!currentEntity) return false; // 无法找到实体

    // 回合进行
    console.log(`【回合${game.turn}】轮到【${currentEntity.name}(${currentEntity.team_id})】`);
    if (currentEntity.no) {
        const enemies = game.getEnemies(game.current_entity);
        const randomOne = sample(enemies);
        if (randomOne) {
            console.log(`【${currentEntity.name}(${currentEntity.team_id})】使用技能1`, currentEntity.useSkill(game, 1, randomOne.entity_id)); // 使用一技能随机攻击敌人)
        }

    }

    game.enqueueTask(phaseRunWay, {}, '计算行动条');
    return true;
};
