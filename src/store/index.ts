import Vue from 'vue';
import Vuex from 'vuex';
import datas from '../../core/fixtures/heros.json';
import {sampleSize, map, filter} from 'lodash';

const ids = filter(map(datas, 'id'), d => !!d);

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        team0: sampleSize(ids, 5).map(no => ({no, teamId: 0})),
        team1: sampleSize(ids, 5).map(no => ({no, teamId: 1})),
    },
    mutations: {
        UPDATE_TEAM_MEMBER(state, data) {
            if (data.teamId === 0) {
                Vue.set(state.team0, data.index, {no: data.no, teamId: 0});
            }
            if (data.teamId === 1) {
                Vue.set(state.team1, data.index, {no: data.no, teamId: 1});
            }
        }
    },
    actions: {},
    modules: {},
});
