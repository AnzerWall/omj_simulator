export default class Effect {
    constructor(public property_name: string, public op: Operator, public value: number) {}
}

export const enum Operator {
    ADD,
    SET,
    NOTHING,
}
