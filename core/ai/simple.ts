import {Codes, Game} from '../system';
import Dispatcher from '../event-data-types/dispatcher'
import PhaseActionDataType from '../event-data-types/action';
import { sample } from 'lodash';
import Hero from '../system/hero';

export default class SimpleAI extends Dispatcher {
    onPhaseAction(game: Game, data: PhaseActionDataType): void {
        const currentEntity = game.getEntity(data.current_entity_id);

        if (currentEntity && currentEntity.hasTag('simple_hero')) {
            const enemies = game.getEnemies(data.current_entity_id);
            const randomOne = sample(enemies);
            if (randomOne) {
                (currentEntity as Hero).skill(0, randomOne); // 对随机敌人使用普攻
            }

        }
    }

}
