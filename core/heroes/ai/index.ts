import {Game} from '../../index';
import TurnData from '../../turn-data';

export function normalAI(game: Game, turnData: TurnData): boolean {
    const enemy = game.getRandomEnemy(turnData.currentId);
    if (enemy) {
        game.actionUseSkill(1, turnData.currentId, enemy.entityId);

    }
    return true;
}

// export default class AkaJita extends Entity {
//     ai(game: Game, turn: any): boolean {
//         /**
//          赤舌
//          --技能选择
//          当敌方单位数大于等于2时：
//          鬼火大于等于3时：使用3技能[风鼓雷]。
//          鬼火小于3时：使用1技能[海扁]。
//          当敌方单位数小于2时：
//          鬼火大于5时：使用3技能[风鼓雷]。
//          鬼火小于等于5时：使用1技能[海扁]。
//          上述鬼火判定中的“3”在非通常情况下受其他因素影响(如真大蛇、苍风一目连)，“5”不受影响。
//          --目标选择
//          1技能[海扁]：当敌方有生命比例在20%以下的单位时，优先选择其中生命比例最低的单位为目标。
//          */
//         const enemies = game.getEnemies(this.entityId);
//         if (enemies.length === 0) return false;
//
//         const line = enemies.length >= 2 ? 5 : 3;
//
//         const mana = game.getMana(this.teamId);
//         if (!mana) return false;
//         if (mana.num > line) {
//             if (game.actionCheckAndUseSkill(2, this.entityId, enemies[0].entityId)) return true;
//         }
//
//         const enemy = game.getRandomEnemy(this.entityId);
//         if (!enemy) return false;
//         game.actionUseSkill(1, this.entityId, enemy.entityId);
//         return true;
//     }
// }
// export default class AmoNoJakuAka extends Entity {
//     ai(game: Game, turn: any): boolean {
//         /**
//          天邪鬼赤
//          --技能选择
//          使用2技能[挑衅]。
//          --目标选择
//          1技能[肉弹战车]：随机。
//          2技能[挑衅]：随机。
//          */
//         const enemy = game.getRandomEnemy(this.entityId);
//         if (!enemy) return false;
//
//         if (game.actionCheckAndUseSkill(2, this.entityId, enemy.entityId)) {
//             return true;
//         }
//
//         game.actionUseSkill(1, this.entityId, enemy.entityId);
//
//         return true;
//     }
// }
