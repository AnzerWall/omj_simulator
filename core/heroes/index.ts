import Miketsu from './miketsu/hero';
import {Entity} from '../system';
import datas from '../fixtures/heros.json';
import { forEach } from 'lodash';
import build from './simple_hero_builder';


type EntityClass = {new(): Entity; }

export const HeroTable: Map<number, EntityClass> = new Map<number, EntityClass>();

forEach(datas, data => {
   HeroTable.set(data.id, build(data));
});
HeroTable.set(304, Miketsu); // 御馔津
