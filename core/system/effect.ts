import Game from './game';

export default interface Effect {
    property_name: string;
    op: Operator;
    value: number;
}

export const enum Operator {
    ADD,
    SET,
    NOTHING,
}
