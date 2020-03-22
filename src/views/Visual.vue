<template>
    <div class="debug" >
        <a-button @click="step" :block="false" style="width: 100px; margin-bottom: 20px;">下一步</a-button>
        <div ref="container"> </div>

    </div>
</template>
<script>
    import Phaser from 'phaser';
    import BattleScene from "@/visual/battle-scene"

    export default {
        mounted() {
            const data = this.$store.state.team0.concat(this.$store.state.team1)
            const scene = new BattleScene(data);

            new Phaser.Game({
                type:Phaser.AUTO,
                width: 1000,
                height: 700,
                parent: this.$refs.container,
                scene,
            })

        },
        methods: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            step() {

            }
        }

    }
</script>
<style>
    .debug {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
    }
</style>
