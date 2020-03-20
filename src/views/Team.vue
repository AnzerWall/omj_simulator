<template>
    <div class="team">
        <div style="font-weight: bold; margin-bottom: 20px">队伍1：</div>
        <div v-for="index in 5" :key="'t0_'+ index">
            式神{{index}}:
            <a-select :defaultValue="team0[index - 1].no" :value="team0[index- 1].no" style="width: 120px"
                      @change="handleChange(0, index-1, $event)">
                <a-select-option v-for="hero in heroList" :value="hero.no" :key="hero.no">{{hero.name}}
                </a-select-option>
            </a-select>
        </div>
        <a-divider/>
        <div style="font-weight: bold; margin-bottom: 20px">队伍2：</div>

        <div v-for="index in 5" :key="'t1_'+ index">
            式神{{index}}:
            <a-select :defaultValue="team1[index - 1].no" :value="team1[index- 1].no" style="width: 120px"
                      @change="handleChange(1, index-1, $event)">
                <a-select-option v-for="hero in heroList" :value="hero.no" :key="hero.no">{{hero.name}}
                </a-select-option>
            </a-select>
        </div>
    </div>
</template>
<script>
    import { HeroData } from '../../core'
    import {mapState} from 'vuex'

    export default {
        data() {
            return {
                heroList: HeroData.map(hero => {
                    return {
                        no: hero.no,
                        name: hero.name,
                    };
                }),
            }
        },
        computed: {
            ...mapState(['team0', "team1"])
        },
        methods: {
            handleChange(teamId, index, no) {
                this.$store.commit('UPDATE_TEAM_MEMBER', {teamId, index, no});
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
