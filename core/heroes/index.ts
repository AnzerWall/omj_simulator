import {map, forEach} from 'lodash';
import HeroData from '../fixtures/hero-data';
import {BattleProperties, Entity, Game, Skill} from '../';
import NormalAttack from './common/normal-attack';
import TurnData from '../turn-data';
import {normalAI} from './ai';
import {amonojakuao_skill1, amonojakuao_skill2} from './n/amanojakuao';
import {nurikabes_skill1, nurikabes_skill2} from './n/nurikabe';
import {kiseirei_skill1} from './n/kiseirei';
import {karakasakozou_skill1, karakasakozou_skill2} from './n/karakasakozou';
import {houkikami_skill1, houkikami_skill2} from './n/houkikami';
import {hakuarashinorei_skill1} from './n/hakaarashinorei';
import {chouchinkozou_skill1, chouchinkozou_skill2} from './n/chouchinkozou';
import {amanojakumidori_skill1, amanojakumidori_skill2} from './n/amanojakumidori';
import {amanojakuki_skill1, amanojakuki_skill2} from './n/amanojakuki';
import {amonojakuaka_skill1, amonojakuaka_skill2} from './n/amanojakuaka';
import {akajita_skill1, akajita_skill2, akajita_skill3} from './n/akajita';

export const HeroTable = new Map<number, any>(map(HeroData, (data) => [data.id, data]));
export const HeroTableByName = new Map<string, any>(map(HeroData, (data) => [data.name, data]));
export const HeroBuilders = new Map<number, () => Entity>();
export {HeroData};

function build(no: number, tags: string[], ai: (game: Game, turnData: TurnData) => boolean, ...skills: Skill[]) {
    const data = HeroTable.get(no);
    HeroBuilders.set(no, function (): Entity {
        const entity = new Entity();
        if (data) {
            entity.setProperty(BattleProperties.MAX_HP, data.hp);
            entity.setProperty(BattleProperties.ATK, data.atk);
            entity.setProperty(BattleProperties.DEF, data.def);
            entity.setProperty(BattleProperties.SPD, data.spd);
            entity.setProperty(BattleProperties.CRI, data.cri);
            entity.setProperty(BattleProperties.CRI_DMG, data.cri_dmg);
            entity.rank = data.rank;
            entity.hp = data.hp;
            entity.name = data.name;
            entity.no = data.id;
            entity.ai = ai;
            forEach(tags, t => {
                entity.addTags(t);
            });
            forEach(skills, s => {
                entity.addSkill(s);
            });

        }
        return entity;
    });
}

HeroTable.forEach((_, no: number) => {
    build(no, ['simple'], normalAI, new NormalAttack('普通攻击'));
});

function HERO(name: string, skills: Skill[], ai: (game: Game, turnData: TurnData) => boolean = normalAI) {
    const dd = HeroData.find(d => d.name === name.trim());
    if (!dd) throw new Error('找不到[' + name + ']');
    build(dd.id, [], ai, ...skills);
}

// N

HERO('赤舌', [
    akajita_skill1,
    akajita_skill2,
    akajita_skill3,
]);
HERO('天邪鬼赤', [
    amonojakuaka_skill1,
    amonojakuaka_skill2,
]);
HERO('天邪鬼青', [
    amonojakuao_skill1,
    amonojakuao_skill2,
]);
HERO('天邪鬼黄', [
    amanojakuki_skill1,
    amanojakuki_skill2,
]);
HERO('天邪鬼绿', [
    amanojakumidori_skill1,
    amanojakumidori_skill2,
]);
HERO('提灯小僧', [
    chouchinkozou_skill1,
    chouchinkozou_skill2
]);
HERO('盗墓小鬼', [
    hakuarashinorei_skill1,
]);
HERO('帚神', [
    houkikami_skill1,
    houkikami_skill2,
]);
HERO('唐纸伞妖', [
    karakasakozou_skill1,
    karakasakozou_skill2,
]);
HERO('寄生魂', [
    kiseirei_skill1,
]);
HERO('涂壁', [
    nurikabes_skill1,
    nurikabes_skill2
]);







