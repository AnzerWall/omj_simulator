<template>
    <div class="debug" ref="container">
        <div>队伍一鬼火:  {{mana1}}({{progress1}})  </div>
        <div>队伍二鬼火:  {{mana2}}({{progress2}}) </div>
        <a-button @click="step" :block="false" style="margin-bottom: 20px;">下一步</a-button>
<!--        <json-tree :raw="tasks" ></json-tree>-->
        <div v-html="tasks"></div>

        <a-table :dataSource="team1" style="margin: 20px 0;" rowKey="entityId" :pagination="false" size="small" >
            <a-table-column title="id" dataIndex="entityId"/>
            <a-table-column title="名称" dataIndex="name"/>
            <a-table-column title="生命" dataIndex="hp"/>
            <a-table-column title="最大生命" dataIndex="max_hp"/>
            <a-table-column title="攻击" dataIndex="atk"/>
            <a-table-column title="防御" dataIndex="def"/>
            <a-table-column title="速度" dataIndex="spd"/>
            <a-table-column title="暴击" dataIndex="cri"/>
            <a-table-column title="暴击伤害" dataIndex="cri_dmg"/>
            <a-table-column title="效果命中" dataIndex="eft_hit"/>
            <a-table-column title="效果抵抗" dataIndex="eft_res"/>
            <a-table-column title="伤害增加" dataIndex="dmg_dealt_buff"/>
            <a-table-column title="伤害降低" dataIndex="dmg_dealt_debuff"/>
            <a-table-column title="易伤" dataIndex="dmg_taken_buff"/>
            <a-table-column title="减伤" dataIndex="dmg_taken_debuff"/>
            <a-table-column title="忽略防御" dataIndex="def_neg"/>
            <a-table-column title="忽略防御百分比" dataIndex="def_neg_p"/>
            <a-table-column title="生命偷取" dataIndex="hp_steal"/>
        </a-table>
        <a-table :dataSource="team2" rowKey="entityId" :pagination="false" size="small">
            <a-table-column title="id" dataIndex="entityId"/>
            <a-table-column title="名称" dataIndex="name"/>
            <a-table-column title="生命" dataIndex="hp"/>
            <a-table-column title="最大生命" dataIndex="max_hp"/>
            <a-table-column title="攻击" dataIndex="atk"/>
            <a-table-column title="防御" dataIndex="def"/>
            <a-table-column title="速度" dataIndex="spd"/>
            <a-table-column title="暴击" dataIndex="cri"/>
            <a-table-column title="暴击伤害" dataIndex="cri_dmg"/>
            <a-table-column title="效果命中" dataIndex="eft_hit"/>
            <a-table-column title="效果抵抗" dataIndex="eft_res"/>
            <a-table-column title="伤害增加" dataIndex="dmg_dealt_buff"/>
            <a-table-column title="伤害降低" dataIndex="dmg_dealt_debuff"/>
            <a-table-column title="易伤" dataIndex="dmg_taken_buff"/>
            <a-table-column title="减伤" dataIndex="dmg_taken_debuff"/>
            <a-table-column title="忽略防御" dataIndex="def_neg"/>
            <a-table-column title="忽略防御百分比" dataIndex="def_neg_p"/>
            <a-table-column title="生命偷取" dataIndex="hp_steal"/>
        </a-table>
    </div>
</template>
<script>
    // import * as PIXI from 'pixi.js';
    import {Game,  BattleProperties} from '../../core'
    import {forEach, values, isArray, some, isObject} from 'lodash';

    export default {
        data() {
            return {
                team1: [],
                team2: [],
                tasks: '',
                mana1: 0,
                mana2: 2,
                progress1: 0,
                progress2: 0,
            }
        },
        mounted() {
            this.game = new Game(this.$store.state.team0.concat(this.$store.state.team1));
            this.syncData();
        },
        methods: {
            syncData() {
                this.team1 = [];
                this.team2 = [];

                this.game.entities.forEach(entity => {
                    const data = {
                        entityId: entity.entityId,
                        no: entity.no,
                        name: entity.name,
                        hp: entity.hp.toFixed(2),
                    }
                    forEach(values(BattleProperties), key => {
                        data[key] = `${entity.getComputedProperty(key)}`
                    });
                    if (entity.teamId === 0) {
                        this.team1.push(data)
                    }
                    if (entity.teamId === 1) {
                        this.team2.push(data)
                    }
                });


                this.mana1 = this.game.manas[0].num;
                this.mana2 = this.game.manas[1].num;
                this.progress1 = this.game.manas[0].progress;
                this.progress2 = this.game.manas[1].progress;
                function formatData(data, depth) {
                    if (isArray(data) && !some(data, isObject)) return `<li>${' '.repeat(depth)}${data.join(' ')}</li>`;
                    return Object.keys(data).map(k => {
                        if (typeof data[k] === "object") return `<li>${' '.repeat(depth)}${k}: <ul>${formatData(data[k], depth+1)}</ul></li>`;
                        return `<li>${' '.repeat(depth)}${k}: ${data[k]}</li>`
                    }).join('')
                }
                function format(t) {
                    // return {
                    //     name: `【${t.type} ${t.step}】`,
                    //     data: t.data,
                    //     children: t.children.map(format)
                    // }
                    return `<ul>${' '.repeat(t.depth)}【${t.type} ${t.step}】${formatData(t.data)}${t.children.map(c => `<li>${format(c)}</li>`).join('')}</ul>`
                }
                this.tasks = format(this.game.dump());

            },
            step() {
                this.game.process();
                this.syncData();
            }
        }

    }
</script>
<style>
    .debug {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
    }
</style>
