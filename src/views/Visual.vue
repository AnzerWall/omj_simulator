<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="debug">
<!--        <div class="float-panel">-->
<!--            123-->
<!--        </div>-->
        <div>Seed: {{data.seed}}</div>
        <div>{{data.hint}}</div>
        <div v-if="data.event">事件: {{data.event}}</div>
        
        <div class="select-skill-field">
            <a-input-number v-model="depth"  style="width: 50px; margin-right: 5px; " :defaultValue="1" :max="10" :min="0"/>
            <a-button @click="step" :block="false" style="width: 100px; ">下一步</a-button>
            <a-button :block="false" style="width: 100px; margin-left: 20px;" v-for="skill in data.skills"
                      :key="skill.no" @click="selectSkill(skill.no)" :disabled="!!selectionNo">{{skill.name || `技能
                ${skill.no}`}}
            </a-button>
            <a-button :block="false" style="width: 100px;  margin-left: 20px;" v-if="data.skills.length"
                      @click="useSkill(0, 0)">AI
            </a-button>
            <a-button :block="false" style="width: 100px;  margin-left: 20px;" v-if="selectionNo"
                      @click="selectionNo = 0">取消
            </a-button>
        </div>
        <div class="runway-field"> 
            <a-avatar  v-for="item in data.runway" :key="item.entityId"   class="runway-item" :class="{team0: item.teamId === 0, team1: item.teamId === 1, frozen: item.frozen}" :src=" '/avatar/'+ item.no + '.png'"  :style="{ left: Math.floor((item.distance / 100)) + '%'}"/>
        </div>
        <div class="team-field" v-for="teamId in 2" :key="teamId">
            <div class="mana">{{manaNum2Text(data.mana[teamId -1])}} {{data.mana[teamId -1].progress}}</div>
            <div class="hero-field">
                <div v-for="e in data.teams[teamId - 1]" :key="e.entityId">
                    <div class="hero-card-wrap"
                         :class="{dead: e.dead,
                     unselectable: selectionNo && selectedSkill && !selectedSkill.targets.includes(e.entityId),
                      selectable: selectionNo && selectedSkill && selectedSkill.targets.includes(e.entityId),
                      'current-turn': data.currentId === e.entityId
                       }"
                         @click="selectHero(e)"
                    >
                        <div class="hero-info">
                            <div class="helo-info-left">
                                <a-avatar class="hero-avatar active" :src=" '/avatar/'+ e.no + '.png'" size="large"/>
                            </div>
                            <div class="hero-properties">
                                <div  v-if="!e.dead" class="bold">{{e.name}}[{{e.entityId}}]</div>
                                <div v-if="!e.dead">
                                    <a-progress size="small" :percent="Math.ceil(e.hp / e.maxHp * 100)"
                                                :showInfo="false"
                                                status="exception"/>
                                </div>
                            </div>
                        </div>
                        <div class="hero-buffs">
                            <div v-for="buff in e.buffs" :key="buff.buffId">
                                <img v-if="buff.icon" :src="'/public/buff/'+icon"/>
                                <a-tag v-else>{{buff.name}} {{buff.count > 1 ? buff.count : ''}}</a-tag>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div>

        </div>
    </div>
</template>
<style lang="scss">
    .debug {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;

    }
    .float-panel {
        position: fixed;
        right: 20px;
        top: 70px;
        width: 300px;
        height: calc(100vh - 90px);
        background-color: #ffffff;
        box-shadow: rgba(0, 0, 0, .3) -1px 1px 5px;
        z-index: 300;
        border-radius: 3px;
        padding: 20px;
    }
    .runway-field {
        width: 500px;
        height: 25px;
        border-radius: 15px;

        position: relative;
        background-color: #00accab4;
        margin-top: 15px;
        .runway-item {
            position: absolute;
            top: 50%;
            transform:translate(-50%, -50%);
            transition: all 0.5s;
            background-color: #fefdff;
            &.team0{
                border:rgb(250, 162, 0) 2px solid;

            }
            &.team1{
                border:rgb(158, 5, 0) 2px solid;
            }
            &.frozen{
                filter: brightness(30%)
            }
        }
    }

    .select-skill-field {
        display: flex;
        flex-direction: row;
        margin-top: 10px;
    }

    .team-field {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        .mana {
            color: #1543a6;
            font-family: Courier;
        }
        .hero-field {
            display: flex;
            flex-direction: row;
            &>:not(:first-child) {
                margin-left: 30px;
            }
            .hero-card-wrap {
                height: 220px;
                width: 180px;
                background-color: #fefdff;
                margin-top: 5px;

                padding: 15px;
                border-radius: 2px;
                position: relative;
                /*border: #000 solid 5px;*/

                &.current-turn {
                    box-shadow: rgba(0, 0, 0, .3) 1px 1px 3px;
                    background-color: burlywood;
                }

                &.unselectable {
                    opacity: 0.3;
                }
                &.dead {
                    opacity: 0.3;
                }
                &.selectable {
                    cursor: pointer;
                }

                .hero-info {
                    display: flex;
                    flex-direction: row;

                    .hero-info-left {
                        .hero-avatar {
                            &.active {
                                border: 2px #2565d6 solid;
                            }
                        }
                    }

                    .hero-properties {
                        flex: 1;
                        padding: 0 0 0 8px;

                        .bold {
                            font-weight: bold;
                        }
                    }
                }

                .hero-buffs {
                    margin-top: 20px;
                }
            }
        }
    }

</style>
<script>
    // import Phaser from 'phaser';
    // import BattleScene from "@/visual/battle-scene"
    import {message} from 'ant-design-vue'
    import {Battle, BattleProperties} from '../../core'
    import {times, map} from 'lodash'

    function empty() {
        return {
            seed: 0,
            hint: '',
            event: '',
            currentId: 0,
            runway: [],
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
                map(Array.from({length: 5}), () => ({
                    entityId: Math.floor(Math.random() * 10000) + 10000,
                    hp: 0,
                    maxHp: 0,
                    dead: true,
                    no: 99,
                    buffs: [],
                    name: '',
                })),
                map(Array.from({length: 5}), () => ({
                    entityId: Math.floor(Math.random() * 10000) + 10000,
                    hp: 0,
                    maxHp: 0,
                    dead: true,
                    no: 99,
                    buffs: [],
                    name: '',
                }))
            ],
            attack: {},
            skills: [],
            watiInput: false,
            selection: null,
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
            if (t.type === 'WaitInput') {
                dump.skills = t.data.skills;
            }
            if (t.type === 'EventProcess') {
                dump.event = '处理' + battle.getEntity(t.data.skillOwnerId).name + t.data.handler.name;
            }
        }
        battle.runway.distanceTable.forEach((distance, entityId) => {
            const entity = battle.getEntity(entityId);
            dump.runway.push({
                entityId,
                distance,
                frozen: battle.runway.frozenTable.get(entityId) || false,
                name: entity.name,
                no: entity.no,
                teamId: entity.teamId,
            });
        });
        dump.runway.sort((a, b) => a.distance - b.distance);
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
                    const buffs = [];
                    buffs.length = 0;

                    for (const b of buffsTemp) {
                        const bb = buffs.find(bbb => bbb.name === b.name);
                        if (bb) {
                            bb.count++;
                        } else {
                            buffs.push({
                                name: b.name,
                                icon: b.icon,
                                buffId: b.buffId,
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
        dump.seed = battle.seed;
        return dump;
    }

    export default {
        data() {
            return {
                seed: Math.random(),
                data: empty(),
                selectionNo: 0,
                selectedSkill: {},
                depth: 1,
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function

        mounted() {
            // eslint-disable-next-line
            const data = this.$store.state.team0.concat(this.$store.state.team1).map(d => Object.assign({}, d, {waitInput: true}));
            window.battle = this.battle = new Battle(data, Date.now(), true);
            this.data = dump(this.battle);
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
        computed: {
            team0() {
                return this.data.teams[0];
            },
            team1() {
                return this.data.teams[1];
            },
        },
        methods: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            step() {
                do {
                    this.battle.process();
                } while (this.battle.currentTask.depth > this.depth && this.battle.currentTask.type !== 'WaitInput');
                this.data = dump(this.battle);
                if (this.battle.isEnd) {
                    message.info('胜利者是队伍' + (this.battle.winner + 1))
                }
            },
            selectSkill(no) {
                const skill = this.data.skills.find(s => s.no === no);
                if (!skill) return;

                this.selectedSkill = skill;
                this.selectionNo = no;
            },

            useSkill(no, targetId) {
                if (this.battle.currentTask.type !== 'WaitInput') return;
                this.selectionNo = 0;
                if (!no) {
                    this.battle.currentTask.data.selection = {no: 0, targetId: 0}
                } else {
                    this.battle.currentTask.data.selection = {no, targetId}
                }
                this.battle.process();
                this.battle.process();
                this.data = dump(this.battle);

            },

            selectHero(e) {
                if (!e) return;
                if (this.selectionNo && this.selectedSkill && this.selectedSkill.targets.includes(e.entityId)) {
                    this.useSkill(this.selectionNo, e.entityId)
                }
            },

            manaNum2Text(mana) {
                if (!mana) return '';

                return times(mana.num,() => '■').concat(times(8 - mana.num,() => '□')).join(' ')
            }


        }

    }
</script>

