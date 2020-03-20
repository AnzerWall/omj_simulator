import {Game, Handler, Skill, AttackTargetInfo, Attack} from '../../';

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

    use(game: Game, sourceId: number, selectedId: number): boolean {
        const selected = game.getEntity(selectedId);
        if (!selected) return false;
        const entities = game.getTeamEntities(selected.teamId);

        for (let i = 0; i < this.times; i++) {

            const attack: Attack = {
                sourceId: sourceId,
                targetsInfo: entities.map(e => {
                    const at = new AttackTargetInfo(e.entityId);
                    at.rate = this.rate;
                    at.shouldComputeCri = true;
                    at.isGroupDamage = true;
                    return at;
                }),
            };
            game.actionAttack(attack);
        }
        return true;
    }
}
