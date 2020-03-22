import {BuffParams, Control, EventCodes, EventData, Battle, Reasons} from '../';

export default function turnProcessor(battle: Battle, {turnData}: EventData, step: number): number {
    if (!turnData || !turnData.currentId) return 0;
    const currentEntity = battle.getEntity(turnData.currentId);

    switch (step) {
        // 开始阶段
        case 1: {
            turnData.cannotAction = battle.hasBuffByControl(currentEntity.entityId,
                Control.DIZZY,
                Control.SLEEP,
                Control.FROZEN,
                Control.POLYMORPH,
            );
            turnData.confusion = battle.hasBuffByControl(currentEntity.entityId, Control.CONFUSION)
            battle.filterBuffByControl(currentEntity.entityId,Control.PROVOKE, Control.SNEER).forEach(buff => {
                turnData.onlyAttack = [buff.sourceId];
            });
            battle.log(`回合${turnData.turn} ${currentEntity.name}(${currentEntity.teamId})`);
            battle.addEventProcessor(EventCodes.TURN_START, currentEntity.entityId, {});
            battle.addEventProcessor(EventCodes.ACTION_START,currentEntity.entityId, {});
            return 2;
        }
        // 处理buff
        case 2: {
            battle.buffs.forEach(buff => {
                if (!buff.hasParam(BuffParams.COUNT_DOWN) || !buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE)) return;
                if (buff.hasParam(BuffParams.COUNT_DOWN) && buff.ownerId === currentEntity.entityId) return; // 不是本人的回合
                if (buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE) && buff.sourceId === currentEntity.entityId) return; // 不是来源的回合

                if (!buff.countDown || buff.countDown <= 1) { // 未提供倒计时或者剩余时间少于一个回合
                    buff.countDown = 0;
                    battle.actionRemoveBuff(buff, Reasons.TIME_OUT);
                } else {
                    buff.countDown = buff.countDown - 1;
                }
            });

            return 3;
        }
        // 推进鬼火条
        case 3: {
            battle.actionUpdateManaProgress(0, currentEntity.teamId, 1, Reasons.RULE);
            return 4;
        }
        // 回合内
        case 4: {
            if (!turnData.cannotAction) {
                if (turnData.onlyAttack.length) {
                    battle.actionUseSkill(1, currentEntity.entityId, turnData.onlyAttack[0]);
                } else if (turnData.confusion) {
                    const target = battle.getRandomEnemy(currentEntity.entityId);
                    if (target) {
                        battle.actionUseSkill(1, currentEntity.entityId, target.entityId);
                    }
                } else {
                    currentEntity.ai(battle, turnData);
                }
            }
            return 5;
        }
        // 回合结束
        case 5: {
            battle.addEventProcessor(EventCodes.ACTION_END, currentEntity.entityId,{});
            battle.addEventProcessor(EventCodes.TURN_END, currentEntity.entityId,{});
            return 6;
        }
        // 结算鬼火进度
        case 6: {
            battle.actionProcessManaProgress(0, currentEntity.teamId);
            return -1;
        }
    }

    return 0;

}
