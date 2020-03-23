import Phaser from 'phaser'
import {Battle, BattleProperties} from '../../core';
import VisibleHero from '@/visual/visible-hero';
import VisibleMana from "@/visual/visiable-mana";
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
    mana: VisibleMana[];
    // text: Phaser.GameObjects.Text;
    constructor(data: BattleData[], seed: number) {
        super({});
        this.battle = new Battle(data, seed);
        this.heros = new Map<number, VisibleHero>();
        this.mana = [];
    }

    init() {
        console.log('init');

    }

    preload() {

        // 加载头像
        this.load.image('bg', 'bg.jpg');
        this.load.image('avatar_common', 'avatar/99.png');
        this.battle.entities.forEach((e) => {
            this.load.image(`avatar_${e.no}`, `avatar/${e.no}.png`);
        });
        console.log('preload');

    }

    create(){
        const _bg = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'bg');
        _bg.scale = 0.5;

        // _bg.scale = 0.6;

        const battle = this.battle;
        for(let teamId = 0; teamId <= 1; teamId++) {
            const field = battle.fields[teamId] || [];
            for(let pos = 0; pos < field.length; pos++) {
                if (field[pos] <= 0) continue;
                const entity = battle.getEntity(field[pos]);
                const hero = new VisibleHero(this, 120 + pos * 180, 160 + teamId * 180, entity, battle);
                this.children.add(hero);
                this.heros.set(entity.entityId, hero)

            }
            const mana = this.mana[teamId] = new VisibleMana(this, battle.getMana(teamId));
            mana.x = this.game.canvas.width - 280;
            mana.y = 20 + teamId * 440;
            this.children.add(mana);

        }
        // this.text = new Phaser.GameObjects.Text(this, 10, 10, '', {});
        // this.children.add(this.text);

        console.log('create');

    }

    update(_: number, __: number): void {

        const battle = this.battle;

        // let text  = '';
        // let t = battle.currentTask;
        // while (t.parent!== null) {
        //     text = t.type + ' >  ' + text;
        //     t = t.parent;
        // }
        // this.text.text = text;

        // let once = true;
        battle.entities.forEach(entity => {
           const hero = this.heros.get(entity.entityId);
           if (hero) {
               hero.u();
           }
        });

        for(let teamId = 0; teamId <= 1; teamId++) {
            this.mana[teamId].u();
        }
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
