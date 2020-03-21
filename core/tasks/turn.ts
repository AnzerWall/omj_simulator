import {BuffParams, Control, EventCodes, EventData, Game, Reasons} from '../';

export default function turnProcessor(game: Game, {turnData}: EventData, step: number): number {
    if (!turnData || !turnData.currentId) return 0;
    const currentEntity = game.getEntity(turnData.currentId);
    if (!currentEntity) return 0; // 无法找到实体

    switch (step) {
        // 开始阶段
        case 1: {
            turnData.cannotAction = currentEntity.cannotAction();
            turnData.confusion = currentEntity.beControlledBy(Control.CONFUSION);
            currentEntity.filterControlByType(Control.PROVOKE, Control.SNEER).forEach(buff => {
                turnData.onlyAttack = [buff.sourceId];
            });
            game.log(`回合${turnData.turn} ${currentEntity.name}(${currentEntity.teamId})`);
            game.addEventProcessor(EventCodes.TURN_START, currentEntity.entityId, {});
            game.addEventProcessor(EventCodes.ACTION_START,currentEntity.entityId, {});
            return 2;
        }
        // 处理buff
        case 2: {
            game.entities.forEach(entity => {
                entity.buffs.forEach(buff => {
                    if (!buff.hasParam(BuffParams.COUNT_DOWN) || !buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE)) return;
                    if (typeof buff.countDown !== 'number') return;

                    if (buff.countDown <= 0) return;
                    if ((entity.entityId === currentEntity.entityId) || // 持有者是本人
                        (buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE) && entity.entityId === currentEntity.entityId) // 维持型buff，buff所有者是本人
                    ) {
                        buff.countDown = buff.countDown - 1;
                        if (buff.countDown <= 0) {
                            game.actionRemoveBuff(entity.entityId, buff, Reasons.TIME_OUT);
                        }
                    }
                });

            });
            return 3;
        }
        // 推进鬼火条
        case 3: {
            game.actionUpdateManaProgress(0, currentEntity.teamId, 1, Reasons.RULE);
            return 4;
        }
        // 回合内
        case 4: {
            if (!turnData.cannotAction) {
                if (turnData.onlyAttack.length) {
                    game.actionUseSkill(1, currentEntity.entityId, turnData.onlyAttack[0]);
                } else if (turnData.confusion) {
                    const target = game.getRandomEnemy(currentEntity.entityId);
                    if (target) {
                        game.actionUseSkill(1, currentEntity.entityId, target.entityId);
                    }
                } else {
                    currentEntity.ai(game, turnData);
                }
            }
            return 5;
        }
        // 回合结束
        case 5: {
            game.addEventProcessor(EventCodes.ACTION_END, currentEntity.entityId,{});
            game.addEventProcessor(EventCodes.TURN_END, currentEntity.entityId,{});
            return 6;
        }
        // 结算鬼火进度
        case 6: {
            game.actionProcessManaProgress(0, currentEntity.teamId);
            return -1;
        }
    }

    return 0;

}
