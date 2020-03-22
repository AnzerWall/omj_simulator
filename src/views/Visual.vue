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
            const scene = this.scene = new BattleScene(data);

            this.game = new Phaser.Game({
                type:Phaser.AUTO,
                width: 800,
                height: 400,
                parent: this.$refs.container,
                scene,
                // transparent: true,
                backgroundColor: '#fff',
            })

        },
        unmounted() {
            this.game.destroy(true);
        },
        methods: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            step() {
                this.scene.battle.process();
                while(this.scene.battle.currentTask !== this.scene.battle.rootTask &&  !this.scene.battle.isEnd) {
                    this.scene.battle.process();
                }
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
