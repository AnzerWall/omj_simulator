import {Battle, BattleProperties, BuffParams, EventCodes, Reasons} from "../index";
import Buff from "../buff";

export class AddBuffProcessing {
    isHit: boolean = false;
    isRes: boolean = false; // 是否抵抗
    cancel: boolean = false;
    constructor(public buff: Buff, public reason: Reasons) {

    }
}
export default function addBuffProcessor(battle: Battle, data: AddBuffProcessing, step: number) {
    const buff = data.buff;
    const target = buff.ownerId < 0 ? null: battle.getEntity(buff.ownerId);
    const source = battle.getEntity(buff.sourceId);

    switch (step) {
        // 数据准备
        case 1: {
            battle.log(`${source ? `【${source.name}(${source.teamId})】` : ''} 准备对`,
                target ? `【${target.name}(${target.teamId})】` : '全局',
                `添加 【${buff.name}】 Buff`,
                buff.countDown  ? (buff.hasParam(BuffParams.COUNT_DOWN_BY_SOURCE) ? '维持' : '持续') + buff.countDown + '回合'  : '');
            battle.addEventProcessor(EventCodes.ADD_BUFF, buff.ownerId,data);
            return 2;
        }
        case 2: {
            if (data.cancel) { // buff被抵消了  庇护 花鸟卷
                return -1;
            }

            if (buff.hasParam(BuffParams.SHOULD_COMPUTE_PROBABILITY)) { // 需要计算概率
                return 3;
            }
            return 4;
        }
        // 命中计算
        case 3: {
            if (!target) return 0;
            if (typeof buff.probability !== 'number') return 0;

            const p = buff.probability * (1 + battle.getComputedProperty(source.entityId, BattleProperties.EFT_HIT) / 100); // 基础命中×（1+效果命中）
             const isHit = data.isHit = battle.testHit(p);
            if (!isHit) return -1; // 未命中
            const res = 1 + battle.getComputedProperty(target.entityId, BattleProperties.EFT_RES) / 100; // (1 + 效果抵抗)
            const isRes = data.isRes = battle.testHit(p / res);
            if (isRes) { // 抵抗了
                battle.addEventProcessor(EventCodes.BUFF_RES,  target.entityId,data);
            }
            return 4;
        }
        case 4: {
            battle.addEventProcessor(EventCodes.BEFORE_BUFF_GET, buff.ownerId,data);
            return 5;
        }
        case 5: {

            // 替换同名buff
            if (buff.maxCount && buff.maxCount > 0 && buff.name) {
                const sameBuffs = battle.buffs.filter(b => b.ownerId === buff.ownerId && b.name === buff.name);
                if (sameBuffs.length >= buff.maxCount) {
                    const index = battle.buffs.indexOf(sameBuffs[0]);
                    if (index === -1) return -1;
                    battle.buffs.splice(index, 1);
                }
            }
            battle.buffs.push(buff);
            battle.addEventProcessor(EventCodes.BUFF_GET, buff.ownerId, data);
            return -1;
        }
    }
    return 0;
}