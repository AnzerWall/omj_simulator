import {BuffParams, Control, EventCodes, Battle, Reasons} from '../';
export class TurnProcessing {
    cannotAction: boolean = false;
    onlyAttack: number[] = [];
    confusion: boolean = false;

    constructor(public turn: number, public currentId: number) {
    }
}

export default function turnProcessor(battle: Battle, data: TurnProcessing, step: number): number {
    const currentEntity = battle.getEntity(data.currentId);

    switch (step) {
        // 开始阶段
        case 1: {
            data.cannotAction = battle.hasBuffByControl(currentEntity.entityId,
                Control.DIZZY,
                Control.SLEEP,
                Control.FROZEN,
                Control.POLYMORPH,
            );
            data.confusion = battle.hasBuffByControl(currentEntity.entityId, Control.CONFUSION);
            battle.filterBuffByControl(currentEntity.entityId,Control.PROVOKE, Control.SNEER).forEach(buff => {
                data.onlyAttack = [buff.sourceId];
            });
            battle.log(`回合${data.turn} ${currentEntity.name}(${currentEntity.teamId})`);
            battle.addEventProcessor(EventCodes.TURN_START, currentEntity.entityId, data);
            battle.addEventProcessor(EventCodes.ACTION_START,currentEntity.entityId, data);
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
            if (!data.cannotAction) {
                if (data.onlyAttack.length) {
                    battle.actionUseSkill(1, currentEntity.entityId, data.onlyAttack[0]);
                } else if (data.confusion) {
                    const target = battle.getRandomEnemy(currentEntity.entityId);
                    if (target) {
                        battle.actionUseSkill(1, currentEntity.entityId, target.entityId);
                    }
                } else {
                    currentEntity.ai(battle, data);
                }
            }
            return 5;
        }
        // 回合结束
        case 5: {
            battle.addEventProcessor(EventCodes.ACTION_END, currentEntity.entityId,data);
            battle.addEventProcessor(EventCodes.TURN_END, currentEntity.entityId,data);
            return 6;
        }
        // 结算鬼火进度
        case 6: {
            const mana = battle.manas[currentEntity.teamId];
            if (!mana) return 0;
            if (mana.progress >= 5) {
                mana.progress = 0;
                mana.preProgress = Math.min(5, mana.preProgress + 1);
                battle.actionUpdateMana(0, currentEntity.teamId, mana.preProgress, Reasons.RULE);
            }
            return -1;
        }
    }

    return 0;

}
