import Miketsu from './miketsu';
import {Entity} from '../system';
import datas from '../fixtures/heros.json';
import {forEach} from 'lodash';
import build from './simple-hero-builder';
import AmoNoJakuAka from './n/amanojakuaka';

type EntityClass = { new(): Entity };

export const HeroTable: Map<number, EntityClass> = new Map<number, EntityClass>();

forEach(datas, data => {
    HeroTable.set(data.id, build(data));
});
// kareru

// N
HeroTable.set(405, AmoNoJakuAka); // 天邪鬼赤

// R

// SR


// SSR
HeroTable.set(304, Miketsu); // 御馔津


// SP
