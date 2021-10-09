import Phaser from 'phaser'
import {Battle, BattleProperties, Task, TurnProcessing} from '../../core';
import VisibleHero from '@/visual/visible-hero';
import VisibleMana from "@/visual/visiable-mana";
import {times} from 'lodash';
import task from "../../core/task";

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

    text: Phaser.GameObjects.Text | undefined;
    constructor(data: BattleData[], seed: number) {
        super({});
        this.battle = new Battle(data, seed);
        this.heros = new Map<number, VisibleHero>();
        this.mana = [];
    }

    init() {
        console.log('init');

    }

    dump() {
        const battle = this.battle;
        const dump = {
            hint: '',
            currentId: 0,
            mana: [
                {
                    num: 0,
                    progress: 0
                },
                {
                    num: 0,
                    progress: 0,
                }
            ],
            teams: [
                times(5, () => ({
                    entityId: 0,
                    hp: 0,
                    maxHp: 0,
                    dead: true,
                    no: 99,
                    buffs: [{name: '', icon: '', count: 0}],
                })),
                times(5, () => ({
                    entityId: 0,
                    hp: 0,
                    maxHp: 0,
                    dead: true,
                    no: 99,
                    buffs: [{name: '', icon: '', count: 0}],
                }))
            ],
            attack: {

            }
        };
        const types = [];
        for (let t: Task | null = battle.currentTask; t; t = t.parent) {
            types.push(`${t.type}【${t.step}】`);
            if (t.type === 'Turn') {
                const data: TurnProcessing = t.data;
                dump.currentId = data.currentId;
            }
        }
        for (let teamId = 0; teamId < 2; teamId++) {
            dump.mana[teamId].num = battle.getMana(teamId).num;
            dump.mana[teamId].progress = battle.getMana(teamId).progress;

            for (let pos = 0; pos < 5; pos++) {
                const field = battle.fields[teamId];
                const id = field[pos];
                if (id) {
                    const entity = battle.getEntity(id);
                    const buffsTemp = battle.buffs
                        .filter(b => b.ownerId === entity.entityId)
                        .map(b => ({name: b.name, icon: b.icon || ''}));
                    const buffs = [{name: '', icon: '', count: 0}];
                    buffs.length = 0;

                    for(const b of buffsTemp) {
                        const bb = buffs.find(bbb => bbb.name === b.name);
                        if (bb) {
                            bb.count++;
                        } else {
                            buffs.push({
                                name: b.name,
                                icon: b.icon,
                                count: 1,
                            })
                        }
                    }

                    dump.teams[teamId][pos] = {
                        entityId: entity.entityId,
                        hp: entity.hp,
                        maxHp: battle.getComputedProperty(entity.entityId, BattleProperties.MAX_HP),
                        dead: entity.dead,
                        no: entity.no,
                        buffs,
                    }
                }
            }
        }
        dump.hint = 'Next:  ' + types.reverse().join(' > ');

        return dump;
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

    create() {
        const dumpData = this.dump();
        const bg = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'bg');
        bg.scale = 0.5;

        // _bg.scale = 0.6;

        for (let teamId = 0; teamId <= 1; teamId++) {
            const field = dumpData.teams[teamId];
            for (let pos = 0; pos < field.length; pos++) {
                const hero = new VisibleHero(this, 120 + pos * 180, 160 + teamId * 180, field[pos]);
                this.children.add(hero);
                this.heros.set(field[pos].entityId, hero)

            }
            const mana = this.mana[teamId] = new VisibleMana(this, dumpData.mana[teamId]);
            mana.x = this.game.canvas.width - 280;
            mana.y = 20 + teamId * 440;
            this.children.add(mana);

        }
        this.text = new Phaser.GameObjects.Text(this, 10, 10, '', {});
        this.children.add(this.text);

        console.log('create');

    }

    update(_: number, __: number): void {
        const dumpData = this.dump();

        for (let teamId = 0; teamId <= 1; teamId++) {
            const field = dumpData.teams[teamId];
            for (let pos = 0; pos < field.length; pos++) {
                const e = field[pos];
                const hero = this.heros.get(e.entityId);
                if (hero) {
                    hero.update(e, dumpData);
                }
            }
            this.mana[teamId].update(dumpData.mana[teamId], dumpData);
        }
        this.text && (this.text.text = dumpData.hint);
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
