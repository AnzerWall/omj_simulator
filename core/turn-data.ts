export default class TurnData {
    cannotAction: boolean = false;
    onlyAttack: number[] = [];
    confusion: boolean = false;

    constructor(public turn: number, public currentId: number) {
    }
}
