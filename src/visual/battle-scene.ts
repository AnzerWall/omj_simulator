import Phaser from 'phaser'
import {Battle, BattleProperties} from '../../core';
import VisibleHero from '@/visual/visible-hero';
// import {forEach, values, isArray, some, isObject} from 'lodash';
type BattleData = {
    no: number;
    teamId: number;
    lv?: number;
    equipments?: number[];
}
export default class BattleScene extends Phaser.Scene {
    battle: Battle;
    heros: Map<number, VisibleHero>;
    constructor(data: BattleData[]) {
        super({});
        this.battle = new Battle(data);
        this.heros = new Map<number, VisibleHero>();
    }

    init() {
        console.log('init');

    }

    preload() {

        // 加载头像
        this.load.path = 'avatar/';
        this.load.image('avatar_common', '99.png');
        this.battle.entities.forEach((e) => {
            this.load.image(`avatar_${e.no}`, `${e.no}.png`);
        });
        console.log('preload');

    }

    create(){
        const battle = this.battle;
        for(let teamId = 0; teamId <= 1; teamId++) {
            const field = battle.fields[teamId] || [];
            for(let pos = 0; pos < field.length; pos++) {
                if (field[pos] <= 0) continue;
                const entity = battle.getEntity(field[pos]);
                const hero = new VisibleHero(this, 100 + pos * 140, 100 + teamId * 140,{
                    hp: entity.hp,
                    shield: 0,
                    maxHp: battle.getComputedProperty(entity.entityId, BattleProperties.MAX_HP),
                    isDead: entity.dead,
                    teamId: teamId,
                    entityId: entity.entityId,
                    no: entity.no,
                });
                this.children.add(hero);
                this.heros.set(entity.entityId, hero)

            }
        }

        console.log('create');

    }

    update(_: number, __: number): void {

        const battle = this.battle;
        // let once = true;
        battle.entities.forEach(entity => {
           const hero = this.heros.get(entity.entityId);

           if (hero) {
               const data = {
                   hp: entity.hp,
                   shield: 0,
                   maxHp: battle.getComputedProperty(entity.entityId, BattleProperties.MAX_HP),
                   isDead: entity.dead,
                   teamId: entity.teamId,
                   entityId: entity.entityId,
                   no: entity.no,
               };
               // if (once) {
               //     console.log(`(${data.maxHp} - ${data.hp}) / ${data.maxHp} = ${((data.maxHp - data.hp)/ data.maxHp) * 180}`);
               //     once = false;
               // }

               hero.updateData(data);
           }
        });
    }

    syncData() {
        // this.team1 = [];
        // this.team2 = [];
        //
        // this.battle.entities.forEach(entity => {
        //     const data = {
        //         entityId: entity.entityId,
        //         no: entity.no,
        //         name: entity.name,
        //         hp: entity.hp.toFixed(2),
        //     }
        //     forEach(values(BattleProperties), key => {
        //         data[key] = `${entity.getProperty(key)}`
        //     });
        //     if (entity.teamId === 0) {
        //         this.team1.push(data)
        //     }
        //     if (entity.teamId === 1) {
        //         this.team2.push(data)
        //     }
        // });
        //
        //
        // this.mana1 = this.battle.manas[0].num;
        // this.mana2 = this.battle.manas[1].num;
        // this.progress1 = this.battle.manas[0].progress;
        // this.progress2 = this.battle.manas[1].progress;
        // function formatData(data, depth) {
        //     if (isArray(data) && !some(data, isObject)) return `<li>${' '.repeat(depth)}${data.join(' ')}</li>`;
        //     return Object.keys(data).map(k => {
        //         if (typeof data[k] === "object") return `<li>${' '.repeat(depth)}${k}: <ul>${formatData(data[k], depth+1)}</ul></li>`;
        //         return `<li>${' '.repeat(depth)}${k}: ${data[k]}</li>`
        //     }).join('')
        // }
        // function format(t) {
        //     // return {
        //     //     name: `【${t.type} ${t.step}】`,
        //     //     data: t.data,
        //     //     children: t.children.map(format)
        //     // }
        //     return `<ul>${' '.repeat(t.depth)}【${t.type} ${t.step}】${formatData(t.data)}${t.children.map(c => `<li>${format(c)}</li>`).join('')}</ul>`
        // }
        // this.tasks = format(this.battle.dump());

    }
}
