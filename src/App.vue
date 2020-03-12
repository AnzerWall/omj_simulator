<template>
    <a-layout id="app">
        <a-layout-sider :trigger="null" collapsible v-model="collapsed">
            <div class="logo">{{collapsed ? 'OS' : 'Onmyoji Simulator'}}</div>
            <a-menu class="site-menu" theme="dark" mode="inline" :defaultSelectedKeys="['1']">
                <a-menu-item key="1">
                    <a-icon type="user"/>
                    <span>首页</span>
                </a-menu-item>
                <a-menu-item key="2">
                    <a-icon type="video-camera"/>
                    <span>队伍设置</span>
                </a-menu-item>
                <a-menu-item key="3">
                    <a-icon type="upload"/>
                    <span>对战调试</span>
                </a-menu-item>
                <a-menu-item key="4">
                    <a-icon type="upload"/>
                    <span>胜率估算</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout class="site-right">
            <a-layout-header class="site-right-header">
                <a-icon
                        class="trigger"
                        :type="collapsed ? 'menu-unfold' : 'menu-fold'"
                        @click="()=> collapsed = !collapsed"
                />
            </a-layout-header>
            <a-layout-content class="site-content"
            >
                <router-view></router-view>

            </a-layout-content>
            <a-layout-footer class="site-footer">
                Onmyoji Simulator ©2020 Created by AnzerWall
            </a-layout-footer>
        </a-layout>
    </a-layout>
</template>
<script>
    export default {
        data() {
            return {
                collapsed: false,
            };
        }
    }
</script>
<style lang="scss">
    #app {
        height: 100vh;

        .site-menu {
            a {
                color: rgba(255, 255, 255, 0.65);
            }
        }


        .logo {
            height: 32px;
            background: #1870d6;
            margin: 16px;
            color: #fbfff9;
            text-align: center;
            line-height: 32px;
            border-radius: 5px;
        }

        .site-right {
            position: relative;
            height: 100vh;

        }

        .site-right-header {
            background: #fff;
            padding: 0;
            width: 100%;
            height: 64px;

            .trigger {
                font-size: 18px;
                line-height: 64px;
                padding: 0 24px;
                cursor: pointer;
                transition: color 0.3s;

                &:hover {
                    color: #1870d6;
                }
            }
        }

        .site-content {
            height: calc(100vh - 64px);
            overflow-x: hidden;
            overflow-y: auto;
        }

        .site-footer {
            text-align: center;
        }

        .site-card {
            margin: 24px 10px 0 10px;
            padding: 24px;
            background: #fff;
            min-height: 280px
        }
    }

</style>
