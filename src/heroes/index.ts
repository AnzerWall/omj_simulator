import datas from '../fixtures/heros.json';
import { forEach } from 'lodash';
import build from './simple_hero_builder';

const Heros = {};

forEach(datas, data => {
    Heros[data.index] = build(data);
});
export { Heros };
