import { Member } from '../member';

export class BuffBase {
    name: string;
    source: Member;
    target: Member;

    constructor(name: string) {
        this.name = name;
    }

    removeFromTarget() {
        this.target.removeBuff(this);
    }

    actionAdd(source: Member, target: Member) {

    }
}
