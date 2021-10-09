import { Attack, AttackParams, Battle, Handler, Skill} from '../../';
import {SkillTarget} from "../../skill";

/**
 * 创建一个单体多段可以触发暴击的普通伤害技能
 */
export default class SingleAttack implements Skill {
    no: number; // 技能编号
    handlers: Handler[] = []; // 其他handler
    passive: boolean = false; // 是否是被动
    name: string;
    cost: number;

    rate: number;
    times: number;
    isNormalAttack: boolean;
    FR: number;
    target: SkillTarget =  SkillTarget.ENEMY
    constructor(no: number, name: string, rate: number, cost: number, times: number = 1, isNormalAttack: boolean = false, FR: number = 0.01) {
        this.no = no;
        this.name = name;
        this.cost = cost;

        this.rate = rate;
        this.times = times;
        this.isNormalAttack = isNormalAttack;
        this.FR = FR;
    }

    use(battle: Battle, sourceId: number, selectedId: number) {
        const selected = battle.getEntity(selectedId);

        for (let i = 0; i < this.times; i++) {
            battle.actionAttack(Attack.build(selectedId, sourceId).rate(this.rate).FR(this.FR).shouldComputeCri().single().normalAttack(this.isNormalAttack).end());
        }
    }
}
