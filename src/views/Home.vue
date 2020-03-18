<template>
    <div class="home">
        {{readme}}
    </div>
</template>

<script>

    export default {
        data() {
            return {
                readme: '玩得开心',
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
