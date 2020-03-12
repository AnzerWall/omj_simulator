<template>
    <div class="site-card">
        <a-table
                :columns="columns"
                :rowKey="record => record.id"
                :dataSource="data"
        >
            <span slot="name" slot-scope="name, record">  <a-avatar :src=" '/avator/'+ record.id + '.png'" />    {{name}}</span>
        </a-table>
    </div>
</template>

<script>
    import { cloneDeep, sortBy } from 'lodash'
    import  _HeroData from '../../core/fixtures/heros.json'

    const columns = [
        {
            title: '编号',
            dataIndex: 'id',
            sorter: true,
        },
        {
            title: '式神',
            width: '20%',
            key: 'name',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' },
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
            return {
                data: sortBy(cloneDeep(_HeroData), 'id').map(data => {
                    data.cri = data.cri * 100 + '%';
                    data['cri_dmg'] = data.cri_dmg * 100 + '%';
                    return data;
                }),
                columns,
            }
        }
    }
</script>

<style scoped>

</style>