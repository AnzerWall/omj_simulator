<template>
    <div class="debug" ref="container">
        <a-button @click="step" :block="false" style="margin-bottom: 20px;" >下一步</a-button>

        <a-table :dataSource="tasks" style="margin-bottom: 20px;" size="small">
            <a-table-column title="提示" dataIndex="hint" />
            <a-table-column title="数据" dataIndex="data" >
                <template slot-scope="data">
                    <json-tree :raw="data" :level="1"></json-tree>
                </template>
            </a-table-column>
        </a-table>
        <a-table :dataSource="team1" style="margin-bottom: 20px;" rowKey="no" :pagination="false" size="small">
            <a-table-column title="编号" dataIndex="no" />
            <a-table-column title="名称" dataIndex="name" />
            <a-table-column title="生命" dataIndex="hp" />
            <a-table-column title="最大生命" dataIndex="max_hp" />
            <a-table-column title="攻击" dataIndex="atk"  />
            <a-table-column title="防御" dataIndex="def" />
            <a-table-column title="速度" dataIndex="spd" />
            <a-table-column title="暴击" dataIndex="cri" />
            <a-table-column title="暴击伤害" dataIndex="cri_dmg" />
            <a-table-column title="效果命中" dataIndex="eft_hit" />
            <a-table-column title="效果抵抗" dataIndex="eft_res" />
            <a-table-column title="伤害增加" dataIndex="dmg_dealt_buff" />
            <a-table-column title="伤害降低" dataIndex="dmg_dealt_debuff" />
            <a-table-column title="易伤" dataIndex="dmg_taken_buff" />
            <a-table-column title="减伤" dataIndex="dmg_taken_debuff" />
            <a-table-column title="忽略防御" dataIndex="def_neg" />
            <a-table-column title="忽略防御百分比" dataIndex="def_neg_p" />
            <a-table-column title="生命偷取" dataIndex="hp_steal" />
        </a-table>
        <a-table :dataSource="team2" rowKey="no"  :pagination="false" size="small">
            <a-table-column title="编号" dataIndex="no" />
            <a-table-column title="名称" dataIndex="name" />
            <a-table-column title="生命" dataIndex="hp" />
            <a-table-column title="最大生命" dataIndex="max_hp" />
            <a-table-column title="攻击" dataIndex="atk"  />
            <a-table-column title="防御" dataIndex="def" />
            <a-table-column title="速度" dataIndex="spd" />
            <a-table-column title="暴击" dataIndex="cri" />
            <a-table-column title="暴击伤害" dataIndex="cri_dmg" />
            <a-table-column title="效果命中" dataIndex="eft_hit" />
            <a-table-column title="效果抵抗" dataIndex="eft_res" />
            <a-table-column title="伤害增加" dataIndex="dmg_dealt_buff" />
            <a-table-column title="伤害降低" dataIndex="dmg_dealt_debuff" />
            <a-table-column title="易伤" dataIndex="dmg_taken_buff" />
            <a-table-column title="减伤" dataIndex="dmg_taken_debuff" />
            <a-table-column title="忽略防御" dataIndex="def_neg" />
            <a-table-column title="忽略防御百分比" dataIndex="def_neg_p" />
            <a-table-column title="生命偷取" dataIndex="hp_steal" />
        </a-table>
    </div>
</template>
<script>
    import * as PIXI from 'pixi.js';
    import Game from '../../core/system/game'
    import datas from '../../core/fixtures/heros.json';
    import {sampleSize, map, filter, forEach, values} from 'lodash';
    import {BattleProperties} from "../../core/fixtures/hero-property-names"

    const ids = filter(map(datas, 'id'), d => !!d);
    const entities = [];
    [0, 1].forEach(teamId => {

        const keys = sampleSize(ids, 5); // 为每个队伍分配5个队员

        for (const no of keys) {
            entities.push({
                no,
                teamId,
            });
        }
        entities[0].no = 304;
    });


    const game = new Game(entities);

    export default {
        data() {
            return {
                team1: [],
                team2: [],
                tasks: [],
            }
        },
        mounted() {
          this.syncData();
        },
        methods: {
            syncData() {
                this.team1 = [];
                this.team2 = [];
                this.tasks = [];
                this.microTasks = [];

                game.entities.forEach(entity => {
                    const data = {
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
                game.microTasks.concat([['', '----', '----']]).concat(game.tasks).forEach(task => {
                    this.tasks.push({
                        hint: task[2],
                        data: JSON.stringify(task[1]),
                    })
                });

            },
            step() {
                game.process();
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
