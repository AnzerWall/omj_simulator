import Game from '../system/game';
import {EventCodes} from '../fixtures/events';
import {Control} from '../fixtures/control';
import {Reasons} from '../fixtures/reasons';

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
    //TODO: 可能需要独立
    const turnData: { cannotAction: boolean; onlyAttack: number[]; randomAttack: boolean } = {
        cannotAction: currentEntity.cannotAction(),
        onlyAttack: [],
        randomAttack: currentEntity.beControlledBy(Control.CONFUSION),
    };

    currentEntity.filterControlByType(Control.PROVOKE, Control.SNEER).forEach(buff => {
        turnData.onlyAttack = [buff.sourceId]
    });

    // buff倒计时
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
    game.actionUpdateManaProgress(0, currentEntity.teamId, 1, Reasons.RULE); // 鬼火进度条
    game.addProcessor(() => {
        if (!turnData.cannotAction) {
            if (turnData.onlyAttack.length) {
                game.actionUseSkill(1, currentEntity.entityId, turnData.onlyAttack[0]);
            } else if (turnData.randomAttack) {
                const target = game.getRandomEnemy(currentEntity.entityId);
                if (target) {
                    game.actionUseSkill(1, currentEntity.entityId, target.entityId);
                }
            } else {
                currentEntity.ai(game, turnData);
            }
        }

        game.dispatch(EventCodes.ACTION_END, {});
        game.dispatch(EventCodes.TURN_END, {});
        game.addProcessor(() => {
            game.actionProcessManaProgress(0, currentEntity.teamId);
            return true;
        });
        // 处理伪回合
        game.addProcessor(phaseRunWay, {}, '[PHASE_RUNWAY]');
        return true;
    }, {}, '[PHASE_TURN] action');

    return true;
}


