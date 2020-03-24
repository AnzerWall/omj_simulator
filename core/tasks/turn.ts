import {Battle, BuffParams, Control, EventCodes, Reasons, WaitInputProcessing} from '../';
import {SelectableSkill, SkillSelection, SkillTarget} from "../skill";
import waitInputProcessor from "./wait-input";

export class TurnProcessing {
    cannotAction: boolean = false;
    onlyAttack: number = 0;
    confusion: boolean = false;
    waitInput?: WaitInputProcessing;
    skills: SelectableSkill[] = [];
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
            battle.filterBuffByControl(currentEntity.entityId, Control.PROVOKE, Control.SNEER).forEach(buff => {
                data.onlyAttack = buff.sourceId;
            });
            if (currentEntity.dead) return -1;
            battle.log(`回合${data.turn} ${currentEntity.name}(${currentEntity.teamId})`);
            battle.addEventProcessor(EventCodes.TURN_START, currentEntity.entityId, data);
            battle.addEventProcessor(EventCodes.ACTION_START, currentEntity.entityId, data);
            return 2;
        }
        // 处理buff
        case 2: {
            battle.buffs.forEach(buff => {
                if (!(buff.hasParam(BuffParams.COUNT_DOWN)  || buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE))) return;
                if (buff.hasParam(BuffParams.COUNT_DOWN)){
                    if ( buff.ownerId !== currentEntity.entityId) return; // 不是本人的回合
                }
                if (buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE)) {
                    if (buff.sourceId !== currentEntity.entityId) return; // 不是来源的回合
                }
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
                if (data.onlyAttack) {
                    battle.actionUseSkill(1, currentEntity.entityId, data.onlyAttack, 0); //TODO: 是否需要确认鬼火
                } else if (data.confusion) {
                    const target = battle.getRandomEnemy(currentEntity.entityId);
                    if (target) {
                        battle.actionUseSkill(1, currentEntity.entityId, target.entityId, 0); //TODO: 是否需要确认鬼火
                    }
                } else {
                    const mana = battle.getMana(currentEntity.teamId);
                    const skills: SelectableSkill[] = currentEntity.skills
                        .filter(s => {
                            if (s.passive) return false;
                            if (s.use === undefined) return false;
                            if (s.hide) return false;
                            const cost: number = typeof s.cost === 'number' ? s.cost : s.cost(battle, currentEntity.entityId);
                            if (cost > 0) {
                                if (!mana || mana.num < cost) return false;
                            }
                            return true;
                        })
                        .map(s => {
                        let targets: number[] = [];
                        if (typeof s.target === 'function') {
                            targets = s.target(battle, currentEntity.entityId)
                        }

                        if (typeof s.target === 'number') {
                            switch (s.target) {
                                case SkillTarget.ENEMY:
                                    targets = battle.getEnemies(currentEntity.entityId).map(e => e.entityId);
                                    break;
                                case SkillTarget.SELF:
                                    targets = [currentEntity.entityId];
                                    break;
                                case SkillTarget.TEAM: {
                                    targets = battle.getTeamEntities(currentEntity.teamId).map(e => e.entityId);
                                    break;
                                }
                            }
                        }


                        return {
                            no: s.no,
                            targets,
                            cost: typeof s.cost === 'number' ? s.cost : s.cost(battle, currentEntity.entityId),
                            name: s.name,
                        }
                    })
                        .filter(s => s.targets.length);
                    data.skills = skills;
                    if (skills.length) {
                        if (battle.waitInput) {
                            data.waitInput = new WaitInputProcessing(skills);
                            battle.addProcessor(waitInputProcessor, data.waitInput, 'WaitInput');
                        }

                    }
                    return 5;
                }
            }
            return 6;
        }
        // 处理选择
        case 5: {
            const mana = battle.getMana(currentEntity.teamId);

            const selection = (data.waitInput && data.waitInput.selection) || currentEntity.ai(battle, data, mana || null, data.skills);

            if (selection && selection.no && selection.targetId) {
                const skill = data.skills.find(s => s.no === selection.no && s.targets.includes(selection.targetId));
                if (skill) {
                    battle.actionUseSkill(selection.no, currentEntity.entityId, selection.targetId, skill.cost)
                }
            }
            return 6;
        }
        // 回合结束
        case 6: {
            battle.addEventProcessor(EventCodes.ACTION_END, currentEntity.entityId, data);
            battle.addEventProcessor(EventCodes.TURN_END, currentEntity.entityId, data);
            return 7;
        }
        // 结算鬼火进度
        case 7: {
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
