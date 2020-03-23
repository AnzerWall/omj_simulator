<template>
    <div class="team">
        <div style="font-weight: bold; margin-bottom: 20px">队伍1：</div>
        <div v-for="index in 5" :key="'t0_'+ index">
            式神{{index}}:
            <a-cascader  :value="convert(team0[index- 1].no)" style="width: 120px"  expandTrigger="hover" :allowClear="false"
                      @change="handleChange(0, index-1, $event)" :options="heroList">
            </a-cascader>
        </div>
        <a-divider/>
        <div style="font-weight: bold; margin-bottom: 20px">队伍2：</div>

        <div v-for="index in 5" :key="'t1_'+ index">
            式神{{index}}:
            <a-cascader :value="convert(team1[index- 1].no)" style="width: 120px"  expandTrigger="hover" :allowClear="false"
                      @change="handleChange(1, index-1, $event)" :options="heroList">
            </a-cascader>
        </div>
    </div>
</template>
<script>
    import { HeroData } from '../../core'
    import {mapState} from 'vuex'

    export default {
        data() {
            return {
                heroList: HeroData.reduce((list, hero) => {
                    const p = list.find(d => d.value.toUpperCase() === hero.rank.toUpperCase());
                    if (p) {
                        p.children.push({
                            value: hero.no,
                            label: hero.name,
                            children: [],
                        });
                    }
                    return list;
                }, [{
                    value: 'sp',
                    label: 'sp',
                    children: [],
                },{
                    value: 'ssr',
                    label: 'ssr',
                    children: [],
                },{
                    value: 'sr',
                    label: 'sr',
                    children: [],
                },{
                    value: 'r',
                    label: 'r',
                    children: [],
                },{
                    value: 'n',
                    label: 'n',
                    children: [],
                }]),
            }
        },
        computed: {
            ...mapState(['team0', "team1"])
        },
        methods: {
            handleChange(teamId, index, seletions) {
                this.$store.commit('UPDATE_TEAM_MEMBER', {teamId, index, no: seletions[1]});
            },
            convert(no) {
                for(const o of this.heroList) {
                    for(const c of o.children) {
                        if (c.value === no) {
                            return [o.value ,c.value];
                        }
                    }
                }
                return [];
            }
        }
    }
</script>
<style>
    .team {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
    }
</style>
