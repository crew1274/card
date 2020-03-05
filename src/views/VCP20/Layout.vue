<template>
  <div id="loyout">
    <el-container>
        <el-aside width="250px">
            <el-image :src="img_uri" fit="contain"></el-image>
            <el-menu default-active="Dashboard" router @select="handle" text-color = "#55585c" active-text-color = "#1ababd">
                <el-menu-item index="Dashboard" route="Dashboard">
                    <h1><i class="el-icon-s-home" />首頁</h1>
                </el-menu-item>
                <el-submenu index="">
                    <template slot="title">
                        <h1><i class="el-icon-s-claim" />上料準備</h1>
                    </template>
                    <el-menu-item-group>
                        <!-- <el-menu-item index="PPR" route="PPR">
                            <h1><i class="el-icon-s-help" />PPR手動套用</h1>
                        </el-menu-item> -->
                        <el-menu-item index="prod" route="prod">
                            <h1><i class="el-icon-s-check" />製程參數套用</h1>
                        </el-menu-item>
                        <el-menu-item index="history" route="history">
                            <h1><i class="el-icon-s-data" />歷史參數套用</h1>
                        </el-menu-item>
                    </el-menu-item-group>
                </el-submenu>
                <el-menu-item index="mo" route="mo">
                    <h1><i class="el-icon-document" />生產履歷</h1>
                </el-menu-item>
                <el-menu-item index="abnormality" route="abnormality">
                    <h1><i class="el-icon-warning" />異常履歷</h1>
                </el-menu-item>
                <el-menu-item index="potion" route="potion">
                    <h1><i class="el-icon-date" />藥水添加記錄</h1>
                </el-menu-item>
                <el-menu-item index="logout" route="login">
                    <h1><i class="el-icon-close" />登出</h1>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
                <transition name="main" mode="out-in">
                    <router-view></router-view>
                </transition>
        </el-container>
    </el-container>
    <!-- <vue-touch-keyboard v-if="visible" :options="options" :layout="layout" :cancel="hide" :accept="keyboard_accept" :input="input" /> -->
  </div>
</template>

<script>
  export default {
    name: 'layout',
    components: { },
    data: function()
    {
        return {
            img_uri: "http://www.cht-pt.com.tw/files/file_pool/1/0g312372164526975026/logo.png",
            now: 'dashboard',
            layout: "normal",
            input: null,
            options:
            {
                useKbEvents: false,
                preventClickEvent: false
            },
        }
    },
    watch:
    {
        getstateisLogin: function (val)
        {
            if(val)
            {
                console.log("連線成功")
            }
            else
            {
                console.log("連線異常")
                this.$store.dispatch('Logout')
                this.$router.push('/login');
            }
        },
    },
    computed:
    {
        getstateisLogin: function()
        {
            return this.$store.state.isLogin
        },
    },
    methods:
    {
        handle(index)
        {
            if(index == 'logout')
            {
                this.$store.dispatch('Logout')
            }
        },
        keyboard_accept()
        {
            this.hide();
        },
        hide()
        {
            this.visible = false;
        },
        show(event) 
        {
            if(this.useKeyboard)
            {
                this.input = event.target;
                this.layout = event.target.dataset.layout;
                if(!this.visible )
                {
                    this.visible = true;
                }
                this.next_step = event.target.id;
            }
        },
    }
    // watch:
    // {
    //     now: function (val)
    //     {
    //         console.log(val)
    //     },
    // }
  }
</script>