import { reduce, pick } from 'lodash'
import datas from './heros.json';
interface HeroJsonData {
    atk: number;
    hp: number;
    def: number;
    spd: number;
    cri: number;
    cri_dmg: number;
    name: string;
}

export default reduce(datas, (pre, data) => {
    pre.set(data.id, pick(data, ['atk', 'hp', 'def', 'spd', 'cri', 'cri_dmg', 'name']));
    return pre;
}, new Map<number, HeroJsonData>());

