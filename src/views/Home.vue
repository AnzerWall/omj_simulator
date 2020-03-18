<template>
    <div class="home" v-html="readme">
    </div>
</template>

<script>
    import readme from '../../readme.md'


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
