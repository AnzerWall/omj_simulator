<template>
    <div class="team">
        <div style="font-weight: bold; margin-bottom: 20px">队伍1：       生命        攻击        防御        速度        暴击        爆伤        命中        抵抗 </div>
        <div v-for="index in 5" :key="'t0_'+ index">
            式神{{index}}: 
            <a-cascader  :value="convert(team0[index- 1].no)" style="width: 120px"  expandTrigger="hover" :allowClear="false"
                      @change="handleChange(0, index-1, $event)" :options="heroList">
            </a-cascader>
            <a-input-number :value="team0[index- 1].max_hp" :min="0" :max="1e10" :precision="2" @change="handleChange2(0, index-1, 'max_hp', $event)"/>
            <a-input-number :value="team0[index- 1].atk" :min="0" :max="100000" :precision="2" @change="handleChange2(0, index-1, 'atk', $event)"/>
            <a-input-number :value="team0[index- 1].def" :min="0" :max="100000" :precision="2" @change="handleChange2(0, index-1, 'def', $event)"/>
            <a-input-number :value="team0[index- 1].spd" :min="0" :max="1000" :precision="2" @change="handleChange2(0, index-1, 'spd', $event)"/>
            <a-input-number :value="team0[index- 1].cri" :min="0" :max="10" :precision="4" @change="handleChange2(0, index-1, 'cri', $event)"/>
            <a-input-number :value="team0[index- 1].cri_dmg" :min="0" :max="10" :precision="4" @change="handleChange2(0, index-1, 'cri_dmg', $event)"/>
            <a-input-number :value="team0[index- 1].eft_hit" :min="0" :max="10000" :precision="2" @change="handleChange2(0, index-1, 'eft_hit', $event)"/>
            <a-input-number :value="team0[index- 1].eft_res" :min="0" :max="10000" :precision="2" @change="handleChange2(0, index-1, 'eft_res', $event)"/>

        </div>
        <a-divider/>
        <div style="font-weight: bold; margin-bottom: 20px">队伍2：       生命        攻击        防御        速度        暴击        爆伤        命中        抵抗 </div>

        <div v-for="index in 5" :key="'t1_'+ index">
            式神{{index}}:
            <a-cascader :value="convert(team1[index- 1].no)" style="width: 120px"  expandTrigger="hover" :allowClear="false"
                      @change="handleChange(1, index-1, $event)" :options="heroList">
            </a-cascader>
             <a-input-number :value="team1[index- 1].max_hp" :min="0" :max="1e10" :precision="2" @change="handleChange2(1, index-1, 'max_hp', $event)"/>
            <a-input-number :value="team1[index- 1].atk" :min="0" :max="100000" :precision="2" @change="handleChange2(1, index-1, 'atk', $event)"/>
            <a-input-number :value="team1[index- 1].def" :min="0" :max="100000" :precision="2" @change="handleChange2(1, index-1, 'def', $event)"/>
            <a-input-number :value="team1[index- 1].spd" :min="0" :max="1000" :precision="2" @change="handleChange2(1, index-1, 'spd', $event)"/>
            <a-input-number :value="team1[index- 1].cri" :min="0" :max="10" :precision="4" @change="handleChange2(1, index-1, 'cri', $event)"/>
            <a-input-number :value="team1[index- 1].cri_dmg" :min="0" :max="10" :precision="4" @change="handleChange2(1, index-1, 'cri_dmg', $event)"/>
            <a-input-number :value="team1[index- 1].eft_hit" :min="0" :max="10000" :precision="2" @change="handleChange2(1, index-1, 'eft_hit', $event)"/>
            <a-input-number :value="team1[index- 1].eft_res" :min="0" :max="10000" :precision="2" @change="handleChange2(1, index-1, 'eft_res', $event)"/>

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
                            // children: [],
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
             handleChange2(teamId, index, key, v) {
                 console.log(teamId, index, key, v)
                this.$store.commit('UPDATE_TEAM_MEMBER', {teamId, index, [key]: v});
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
