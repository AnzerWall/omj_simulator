import Battle from "../battle";
import {SelectableSkill, SkillSelection} from "../skill";

export class WaitInputProcessing{
    constructor(public skills: SelectableSkill[]) {

    }
    selection: SkillSelection | null = null;

}
export default function waitInputProcessor(battle: Battle, data: WaitInputProcessing, step: number) {
    switch (step) {
        case 1: {
            if (data.selection) return -1;
            return 1;
        }
    }
    return;
}