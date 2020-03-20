<template>
    <div class="site-card">
        <a-table
                :columns="columns"
                :rowKey="record => record.name"
                :dataSource="data"
        >
            <span slot="name" slot-scope="name, record">  <a-avatar :src=" '/avator/'+ record.no + '.png'"/>    {{name}}</span>
        </a-table>
    </div>
</template>

<script>
    import {HeroTable, BattleProperties} from '../../core'

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
            title: '技能已实现',
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
            const heros = [];

            HeroTable.forEach(Hero => {
                heros.push(new Hero())
            })
            return {
                data: heros.map(hero => {

                    return {
                        no: hero.no,
                        name: hero.name,
                        hp: hero.getComputedProperty(BattleProperties.MAX_HP),
                        atk: hero.getComputedProperty(BattleProperties.ATK),
                        def: hero.getComputedProperty(BattleProperties.DEF),
                        spd: hero.getComputedProperty(BattleProperties.SPD),
                        cri: hero.getComputedProperty(BattleProperties.CRI) * 100 + '%',
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        cri_dmg: hero.getComputedProperty(BattleProperties.CRI_DMG) * 100 + '%',
                        ok: hero.hasTag('simple') ? '否' : '是',
                    };
                }),
                columns,
            }
        }
    }
</script>

<style scoped>

</style>
