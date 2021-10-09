import Vue from 'vue';
import Vuex from 'vuex';
import datas from '../../core/fixtures/heros.json';
import {sampleSize, map, filter} from 'lodash';

Vue.use(Vuex);
function data2myData(data: any) {
    if (!data) return {};
    return {no: data.id, max_hp: data.hp, atk: data.atk, def: data.def, spd: data.spd, cri: data.cri, cri_dmg: data.cri_dmg, eft_hit: 0, eft_res: 0, waitInput: false, index: 0};
}
export default new Vuex.Store({
    state: {
        team0: sampleSize(datas, 5).map(data => Object.assign({teamId: 0, waitInput: false}, data2myData(data))),
        team1: sampleSize(datas, 5).map(data => Object.assign({teamId: 1, waitInput: false}, data2myData(data))),
    },
    mutations: {
        UPDATE_TEAM_MEMBER(state, data) {
            const hero = datas.find(d => d.id === data.no);
            if (data.teamId === 0) {
                Vue.set(state.team0, data.index, Object.assign({teamId: 0, waitInput: false}, state.team0[data.index], data2myData(hero), data));
            }
            if (data.teamId === 1) {
                Vue.set(state.team1, data.index, Object.assign({teamId: 1, waitInput: false}, state.team1[data.index], data2myData(hero), data));
            }
        }
    },
    actions: {},
    modules: {},
});
