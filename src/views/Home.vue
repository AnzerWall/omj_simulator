<template>
    <div class="home" v-html="readme">
    </div>
</template>

<script>
const readme = `
目前可以做到：    如果全式神40级不带御魂分列两队，无任何技能纯普攻不带效果对A的胜率预测

核心组件
- [x] UI-式神数据页
- [x] UI-队伍录入页
- [x] UI-对战调试页(基础)
- [x] UI-对弈竞猜预测页(对战模拟法)
- [ ] UI-对弈竞猜预测页(机器学习法)
- [x] Mana(鬼火机制)
- [x] Runway(行动条)
- [x] Team(队伍)
- [ ] Equipment(基础御魂)
- [x] Buff(buff机制)
- [x] Skill(技能机智)
- [x] Entity(实体)
- [x] Hero(式神)
- [x] Event(事件机制)

机制
- [ ] 实现式神技能需要的机制

式神技能

进度(0/139)

式神AI

进度(0/139)

`.replace(/\n/g, '</br>')
    export default {
        data() {
            return {
                readme,
            }
        }
    };
</script>
<style>
    .home {

        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
    }
</style>
