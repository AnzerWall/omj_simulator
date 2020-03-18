import Game from '../system/game';
import {sample} from 'lodash';
import {EventCodes} from '../fixtures/events';

export function phaseGameStart(game: Game): boolean {
    game.dispatch(EventCodes.GAME_START);
    game.addProcessor(() => {
        game.runway.compute();
        return true;
    }, {}, '[PHASE_GAME_START] compute runway');
    game.dispatch(EventCodes.SENKI);
    game.addProcessor(() => {
        game.currentId = game.runway.getNext() || 0;
        game.turn++;
        return true;
    }, {}, '[PHASE_GAME_START] set current entity');
    game.addProcessor(phaseTurn, {}, '[PHASE_TURN]'); // 进入先机阶段
    return true;
}

export function phaseRunWay(game: Game): boolean {
    game.judgeWin();
    if (game.isEnd) return false;

    game.currentId = game.runway.computeNext() || 0;
    game.turn++;

    game.addProcessor(phaseTurn, {}, '[PHASE_TURN]');
    return true;
}
export function phaseTurn(game: Game): boolean {
    if (!game.currentId) return false; // 当前无下一个玩家

    const currentEntity = game.getEntity(game.currentId);
    if (!currentEntity) return false; // 无法找到实体

    // 回合进行
    console.log(`[TURN_${game.turn}] Turn Entity: ${currentEntity.name}(${currentEntity.teamId})`);
    game.dispatch(EventCodes.TURN_START, {});
    game.dispatch(EventCodes.ACTION_START, {});
    game.addProcessor(() => {
        game.entities.forEach(entity => {
            entity.buffs.forEach(buff => {
                if (buff.countDown <= 0) return;
                if ((entity.entityId === currentEntity.entityId) || // 持有者是本人
                    (buff.countDownBySource && entity.entityId === currentEntity.entityId) // 维持型buff，buff所有者是本人
                ) {
                    buff.countDown = buff.countDown - 1;
                    if (buff.countDown <= 0) {
                        game.actionRemoveBuff(0, entity.entityId, buff);
                    }
                }
            });

        });

        return true;
    }, {}, '[PHASE_TURN] process buff');
    game.addProcessor(() => {

        if (currentEntity.no) {
            const enemies = game.getEnemies(game.currentId);
            const randomOne = sample(enemies);
            if (randomOne) {
                console.log(`[SKILL]【${currentEntity.name}(${currentEntity.teamId})】use skill 1`, game.actionUseSkill(1, currentEntity.entityId, randomOne.entityId)); // 使用一技能随机攻击敌人)
            }
        }
        game.dispatch(EventCodes.ACTION_END, {});
        game.dispatch(EventCodes.TURN_END, {});
        game.addProcessor(phaseRunWay, {}, '[PHASE_RUNWAY]');
        return true;
    }, {}, '[PHASE_TURN] action');

    return true;
}


