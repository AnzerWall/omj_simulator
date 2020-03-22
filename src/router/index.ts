import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Team from '../views/Team.vue';
import Debug from '../views/Debug.vue';
import Predict from '../views/Predict.vue';
import Hero from '../views/Hero.vue';
import Visual from '../views/Visual.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/team',
        name: 'Team',
        component: Team,
    },
    {
        path: '/debug',
        name: 'Debug',
        component: Debug,
    },
    {
        path: '/predict',
        name: 'Predict',
        component: Predict,
    },
    {
        path: '/hero',
        name: 'Hero',
        component: Hero,
    },
    {
        path: '/visual',
        name: 'Visual',
        component: Visual,
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
