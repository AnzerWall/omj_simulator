<template>
    <div class="debug" >
        <a-button @click="step" :block="false" style="width: 100px; margin-bottom: 20px;">下一步</a-button>
<!--        <div ref="container"> </div>-->
        <json-tree :data="data" ></json-tree>
        <div>

        </div>
    </div>
</template>
<style>
    .debug {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
    }
</style>
<script>
    // import Phaser from 'phaser';
    // import BattleScene from "@/visual/battle-scene"
    // import { message } from 'ant-design-vue'
    import { Battle, BattleProperties } from '../../core'
    import { times } from 'lodash'
    function empty() {
        return {
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
                    buffs: [],
                    name: '',
                })),
                times(5, () => ({
                    entityId: 0,
                    hp: 0,
                    maxHp: 0,
                    dead: true,
                    no: 99,
                    buffs: [],
                    name: '',
                }))
            ],
            attack: {}
        };
    }
    function dump(battle) {
        const dump = empty();
        const types = [];
        for (let t = battle.currentTask; t; t = t.parent) {
            types.push(`${t.type}【${t.step}】`);
            if (t.type === 'Turn') {
                const data = t.data;
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
                        name: entity.name,
                        buffs,
                    }
                }
            }
        }
        dump.hint = 'Next:  ' + types.reverse().join(' > ');

        return dump;
    }
    export default {
        data() {
            return {
                seed: Math.random(),
                data: empty(),
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function

        mounted() {
            // eslint-disable-next-line
            const data = this.$store.state.team0.concat(this.$store.state.team1);
            this.battle = new Battle(data);
            // const scene = this.scene = new BattleScene(data, this.seed);
            //
            // this.game = new Phaser.Game({
            //     type:Phaser.AUTO,
            //     width: 1920 / 2,
            //     height: 971 / 2,
            //     parent: this.$refs.container,
            //     scene,
            //     // transparent: true,
            //     backgroundColor: '#fff',
            // })

        },
        unmounted() {
            // this.game.destroy(true);
        },
        methods: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            step() {
                do {
                    this.battle.process();
                } while(this.battle.currentTask.depth > 2);
                this.data = dump(this.battle);
                // if (this.scene.battle.isEnd) {
                //     message.info('胜利者是队伍' + (this.scene.battle.winner + 1) )
                // }
            }
        }

    }
</script>

