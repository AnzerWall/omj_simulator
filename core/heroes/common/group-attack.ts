import {Attack, AttackParams, Battle, Handler, Skill} from '../../';

/**
 * 创建一个群体多段可以触发暴击的普通伤害技能
 */
export default class GroupAttack implements Skill {
    no: number; // 技能编号
    handlers: Handler[] = []; // 其他handler
    passive: boolean = false; // 是否是被动
    name: string;

    rate: number;
    times: number;
    cost: number;

    constructor(no: number, name: string, rate: number, cost: number, times: number = 1) {
        this.no = no;
        this.name = name;
        this.cost = cost;

        this.rate = rate;
        this.times = times;
    }

    use(battle: Battle, sourceId: number, selectedId: number): boolean {
        const selected = battle.getEntity(selectedId);
        const entities = battle.getTeamEntities(selected.teamId);

        for (let i = 0; i < this.times; i++) {
            const infos = entities.map(e => Attack.build(e.entityId, sourceId)
                .rate(this.rate)
                .shouldComputeCri()
                .group()
                .end()
            );
            battle.actionAttack(infos);
        }
        return true;
    }
}
