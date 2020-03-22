<template>
    <div class="predict">
        <div>注意本项目尚在开发中，必须保证下面列表中所有式神均已实现ai和技能才有参考价值</div>
        <div style="margin-bottom: 20px;">
            测试次数:
            <a-input-number :min="1" :max="1000" v-model="count"/>
            <a-button @click="getWinner" :loading="!!total">预测</a-button>
            {{total ? ' 剩余计算次数' + total : ''}} 队伍1赢{{winner0}}次({{Math.floor(winner0/count*100)}}%)
            队伍2赢{{winner1}}次({{Math.floor(winner1/count*100)}}%)
        </div>
        <a-table
                :columns="columns"
                rowKey="id"
                :dataSource="data"
                size="small"
                :pagination="false"
        >
            <span slot="name" slot-scope="name, record">  <a-avatar :src=" '/avatar/'+ record.no + '.png'"/>    {{name}}</span>
        </a-table>

    </div>
</template>
<script>
    import {Battle, HeroBuilders, BattleProperties} from '../../core'

    const columns = [
        {
            title: '编号',
            dataIndex: 'no',
        },
        {
            title: '式神',
            width: '20%',
            key: 'name',
            dataIndex: 'name',
            scopedSlots: {customRender: 'name'},
        },
        {
            title: '队伍编号',
            dataIndex: 'teamId',
        },
        {
            title: '已实现',
            dataIndex: 'ok',
        },
        {
            title: '生命',
            dataIndex: 'hp',
        },
        {
            title: '攻击',
            dataIndex: 'atk',
        },
        {
            title: '防御',
            dataIndex: 'def',
        },
        {
            title: '速度',
            dataIndex: 'spd',
        },
        {
            title: '暴击',
            dataIndex: 'cri',
        },
        {
            title: '暴击伤害',
            dataIndex: 'cri_dmg',
        },
    ];


    export default {
        data() {
            const list = [];

            [0, 1].forEach(teamId => {
                for(let index = 0; index < 5; index++) {
                    const no = this.$store.state['team' + teamId][index].no;
                    const hero = HeroBuilders.get(no)();

                    const data = {
                        id: teamId + '_' + hero.no + index,
                        no: hero.no,
                        name: hero.name,
                        hp: hero.getProperty(BattleProperties.MAX_HP),
                        atk: hero.getProperty(BattleProperties.ATK),
                        def: hero.getProperty(BattleProperties.DEF),
                        spd: hero.getProperty(BattleProperties.SPD),
                        cri: hero.getProperty(BattleProperties.CRI) * 100 + '%',
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        cri_dmg: hero.getProperty(BattleProperties.CRI_DMG) * 100 + '%',
                        ok: hero.hasTag('simple') ? '否' : '是',
                        teamId,
                    };
                    list.push(data);
                }

            })

            return {
                count: 100,
                winner0: 0,
                winner1: 0,
                error: 0,
                data: list,
                columns,
                total: 0,
            }
        },
        methods: {
            getWinner() {
                this.winner0 = this.winner1 = this.process = 0;
                this.total = this.count;
                const fn = () => {
                    if (!this.total) return;
                    this.total--
                    const battle = new Battle(this.$store.state.team0.concat(this.$store.state.team1));
                    // eslint-disable-next-line no-empty
                    while (battle.process()) {
                    }
                    if (battle.winner === 0) this.winner0++;
                    else if (battle.winner === 1) this.winner1++;
                    else this.error++;
                    setTimeout(fn, 10);
                }
                setTimeout(fn, 10);

            }
        }

    }
</script>
<style>
    .predict {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
    }
</style>
