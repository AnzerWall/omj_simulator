import Codes from './codes';

export default class Event {
    public readonly data: object;

    constructor(public code: Codes, data: object = {}) {
        this.data = Object.create(data);
        Object.seal(this.data);
    }
}
