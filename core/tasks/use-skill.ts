import {Reasons, Battle} from "../";

export class UseSkillProcessing {
    constructor(public no: number, public sourceId: number, public selectedId: number, public reason: Reasons = Reasons.NOTHING) {

    }
}

export default function useSkillProcessor(battle: Battle, data: UseSkillProcessing, step: number) {
    if (!(data instanceof UseSkillProcessing)) return 0;

    const source = battle.getEntity(data.sourceId);
    const selected = battle.getEntity(data.selectedId);
    const skill = source.getSkill(data.no);
    switch (step) {
        case 1 : {
            if (skill.check && !skill.check(battle, data.sourceId)) return 0;
            const cost = typeof skill.cost === 'number' ? skill.cost : skill.cost(battle, data.sourceId);
            battle.log(`【${source.name}(${source.teamId})】对【${selected.name}(${selected.teamId})】使用技能【${skill.name}】`);

            if (cost > 0) {
                // battle.actionUpdateMana(source.entityId, source.teamId, -cost, Reasons.COST);
            }
            return 2;
        }
        case 2: {
            (skill.use && skill.use(battle, data.sourceId, data.selectedId));
            return -1;
        }
    }
    return 0;
}