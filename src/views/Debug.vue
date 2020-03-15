<template>
    <div class="debug" ref="container">

    </div>
</template>
<script>
    import * as PIXI from 'pixi.js';

    export default {
        mounted() {
            const app = this.app = new PIXI.Application({
                width: 1000,
                height: 400,
            });
            this.$refs.container.appendChild(app.view);
            app.loader.add('avator/10.png').load((loader, resources) => {
                const avator = resources['avator/10.png'];

                const bunny = new PIXI.Sprite(avator.texture);
                // Setup the position of the bunny
                bunny.x = app.renderer.width / 2;
                bunny.y = 100;

                // Rotate around the center
                bunny.anchor.x = 0.5;
                bunny.anchor.y = 0.5;

                // Add the bunny to the scene we are building
                app.stage.addChild(bunny);

                // Listen for frame updates
                app.ticker.add(() => {
                    // each frame we spin the bunny around a bit
                    bunny.x = bunny.x + Math.random() * 10 - 5;
                    bunny.x = Math.max( 0 , bunny.x);
                    bunny.x = Math.min( 500 , bunny.x)


                });
            });
        }
    }
</script>
<style>
    .debug {
        display: flex;
        justify-content: center;
        padding-top: 50px;
    }
</style>
