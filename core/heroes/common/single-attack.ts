import {Game, Handler, Skill} from '../../system';
import Attack, {AttackTargetInfo} from '../../system/attack';

/**
 * 创建一个单体多段可以触发暴击的普通伤害技能
 */
export class SingleAttack implements Skill {
    no: number; // 技能编号
    handlers: Handler[] = []; // 其他handler
    passive: boolean = false; // 是否是被动
    name: string;
    cost: number;

    rate: number;
    times: number;
    isNormalAttack: boolean;
    FR: number;

    constructor(no: number, name: string, rate: number = 1.25, cost: number = 0, times: number = 1, isNormalAttack: boolean = false, FR: number = 0.01) {
        this.no = no;
        this.name = name;
        this.cost = cost;

        this.rate = rate;
        this.times = times;
        this.isNormalAttack = isNormalAttack;
        this.FR = FR;
    }

    use(game: Game, sourceId: number, selectedId: number): boolean {
        for (let i = 0; i < this.times; i++) {
            const at = new AttackTargetInfo(selectedId);
            at.rate = this.rate;
            at.shouldComputeCri = true;
            at.isSingleDamage = true;
            at.isNormalAttack = this.isNormalAttack;
            at.FR = this.FR;

            const attack: Attack = {
                sourceId: sourceId,
                targetsInfo: [at],
            };
            game.actionAttack(attack)
        }
        return true;
    }
}
