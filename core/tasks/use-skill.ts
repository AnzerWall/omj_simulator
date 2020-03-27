import {Reasons, Battle} from "../";
let skillCounter = 0; // 技能使用的计数器
export class UseSkillProcessing {
    skillId: number = ++skillCounter;
    constructor(public no: number, public sourceId: number, public selectedId: number, public cost: number, public reason: Reasons = Reasons.NOTHING) {

    }
}

export default function useSkillProcessor(battle: Battle, data: UseSkillProcessing, step: number) {
    if (!(data instanceof UseSkillProcessing)) return 0;

    const source = battle.getEntity(data.sourceId);
    const selected = battle.getEntity(data.selectedId);
    const skill = source.getSkill(data.no);
    switch (step) {
        case 1 : {
            battle.log(`【${source.name}(${source.teamId})】对【${selected.name}(${selected.teamId})】使用技能【${skill.name}】`);

            if (data.cost > 0) {
                battle.actionUpdateMana(source.entityId, source.teamId, -data.cost, Reasons.COST);
            }
            return 2;
        }
        case 2: {
            (skill.use && skill.use(battle, data.sourceId, data.selectedId, data.skillId));
            return -1;
        }
    }
    return 0;
}