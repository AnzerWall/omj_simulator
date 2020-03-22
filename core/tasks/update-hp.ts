import {Reasons} from "../constant";
import Battle from "../battle";


export class UpdateHpProcessing{
    public remainHp: number = 0;
    public isDead: boolean = false;
    constructor(public sourceId: number, public targetId: number,public  num: number, public reason: Reasons = Reasons.NOTHING) {

    }

}

export default function updateHpProcessor(battle: Battle, data: UpdateHpProcessing, step: number) {
    const source = battle.getEntity(data.sourceId);
    const target = battle.getEntity(data.targetId);

    switch (step) {
        case 1: {
            data.remainHp = Math.max(target.hp + data.num, 0);
            data.isDead = data.remainHp <= 0;
            battle.log(`${source ? `【${source.name}(${source.teamId})】` : ''}${data.num < 0 ? '减少' : '恢复'}【${target.name}(${target.teamId})】${Math.abs(data.num)}点血， 剩余${data.remainHp}`, data.isDead ? '【死亡】' : '');
            return 2;
        }
        case 2: {
            if (data.remainHp === undefined || data.isDead === undefined) return 0;
            target.hp = data.remainHp;
            target.dead = data.isDead;

            //TODO: 死亡处理 需要独立出来
            if (data.isDead) {
                const field = battle.fields[target.teamId];
                if (field) {
                    const index = field.indexOf(target.entityId);
                    if (index !== -1) {
                        field[index] = 0;
                    }
                }
                battle.runway.freeze(target.entityId);
            }
            return -1;
        }
    }
    return 0;
}