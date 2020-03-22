import { AttackInfo, AttackParams, Battle, Handler, Skill} from '../../';

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

    constructor(no: number, name: string, rate: number, cost: number, times: number = 1, isNormalAttack: boolean = false, FR: number = 0.01) {
        this.no = no;
        this.name = name;
        this.cost = cost;

        this.rate = rate;
        this.times = times;
        this.isNormalAttack = isNormalAttack;
        this.FR = FR;
    }

    use(battle: Battle, sourceId: number, selectedId: number): boolean {
        const selected = battle.getEntity(selectedId);
        if (!selected) return false;

        for (let i = 0; i < this.times; i++) {
            const at = new AttackInfo(selectedId, {
                sourceId,
                rate: this.rate,
                FR: this.FR,
                params: [AttackParams.SHOULD_COMPUTE_CRI, AttackParams.SINGLE],
            }).addParam(this.isNormalAttack ? AttackParams.NORMAL_ATTACK : null);
            battle.actionAttack(at);
        }
        return true;
    }
}
