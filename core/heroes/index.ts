// import Miketsu from './miketsu';
import {Entity} from '../system';
import datas from '../fixtures/heros.json';
import {forEach} from 'lodash';
import build from './simple-hero-builder';
import AmoNoJakuAka from './n/amanojakuaka';
import AkaJita from './n/akajita';
import AmoNoJakuKi from './n/amanojakuki';
import AmoNoJakuAo from './n/amanojakuao';
import ChouChinKoZou from './n/chouchinkozou';
import HakuArashiNoRei from './n/hakaarashinorei';
import HoukiKami from './n/houkikami';
import KaraKasaKoZou from './n/karakasakozou';
import KiSeiRei from './n/kiseirei';
import NuriKabe from './n/nurikabe';

type EntityClass = { new(): Entity };

export const HeroTable: Map<number, EntityClass> = new Map<number, EntityClass>();

forEach(datas, data => {
    HeroTable.set(data.id, build(data));
});
// kareru

// N
HeroTable.set(AkaJita.no, AkaJita); // 赤舌
HeroTable.set(AmoNoJakuAka.no, AmoNoJakuAka); // 天邪鬼赤
HeroTable.set(AmoNoJakuAo.no, AmoNoJakuAo); // 天邪鬼青
HeroTable.set(AmoNoJakuKi.no, AmoNoJakuKi); // 天邪鬼黄
HeroTable.set(ChouChinKoZou.no, ChouChinKoZou); // 提灯小僧
HeroTable.set(HakuArashiNoRei.no, HakuArashiNoRei); // 盗墓小鬼
HeroTable.set(HoukiKami.no, HoukiKami); // 帚神
HeroTable.set(KaraKasaKoZou.no, KaraKasaKoZou); // 唐伞纸妖
HeroTable.set(KiSeiRei.no, KiSeiRei); // 寄生灵
HeroTable.set(NuriKabe.no, NuriKabe); // 涂壁


// R

// SR


// SSR
// HeroTable.set(304, Miketsu); // 御馔津


// SP
