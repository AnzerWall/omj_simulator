import {SingleAttack} from './single-attack';

export class NormalAttack extends SingleAttack {
    constructor(name = 'normal attack', rate = 1.25, FR = 0.01) {
        super(0, name, rate, 0, 1, true, FR);
    }
}
