<template>
  <div id="loyout">
    <el-container>
        <el-aside width="230px">
            <el-image :src="img_uri" fit="contain">
                <div slot="error">
                    <i class="el-icon-picture-outline"> </i>
                </div>
            </el-image>
            <el-menu default-active="Dashboard" router @select="handle" text-color = "#55585c" active-text-color = "#1ababd">
                <el-menu-item index="Dashboard" route="Dashboard">
                    <h1><i class="el-icon-s-home" />首頁</h1>
                </el-menu-item>
                <!-- <el-submenu index="">
                    <template slot="title">
                        <h1><i class="el-icon-s-claim" />上料準備</h1>
                    </template>
                    <el-menu-item-group>
                        <el-menu-item index="prod" route="prod">
                            <h1><i class="el-icon-s-check" />製程參數套用</h1>
                        </el-menu-item>
                        <el-menu-item index="store" route="store">
                            <h1><i class="el-icon-s-data" />儲存參數套用</h1>
                        </el-menu-item>
                    </el-menu-item-group>
                </el-submenu> -->
                <el-menu-item index="prod" route="prod">
                    <h1><i class="el-icon-s-claim" />上料準備</h1>
                </el-menu-item>
                <!-- <el-menu-item index="store" route="store">
                    <h1><i class="el-icon-s-data" />參數庫管理</h1>
                </el-menu-item> -->
                <el-menu-item index="history" route="history">
                    <h1><i class="el-icon-document" />生產履歷</h1>
                </el-menu-item>
                <!-- <el-menu-item index="statistic" route="statistic">
                    <h1><i class="el-icon-s-data" />資料統計</h1>
                </el-menu-item> -->
                <!-- <el-menu-item index="abnormality" route="abnormality">
                    <h1><i class="el-icon-warning" />異常履歷</h1>
                </el-menu-item> -->
                <!-- <el-menu-item index="document" route="document">
                    <h1><i class="el-icon-document" />使用說明</h1>
                </el-menu-item> -->
                <!-- <el-menu-item index="potion" route="potion">
                    <h1><i class="el-icon-date" />藥水添加記錄</h1>
                </el-menu-item> -->
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
  </div>
</template>

<script>
  export default {
    name: 'layout',
    components: { },
    async mounted()
    {
        await this.get_token()
        this.timer = await setInterval( () => { this.get_token() }, 5000) //定期更新token
    },
    beforeDestroy()
    {
        clearInterval(this.timer)
    },
    data: function()
    {
        return {
            img_uri: require("@/assets/VCP20.png"),
            timer: undefined,
        }
    },
    computed:
    {
        getstateisLogin()
        {
            return this.$store.state._ws_isLogin
        },
    },
    watch:
    {
        getstateisLogin(isLogin)
        {
            if(!isLogin)
            {
                location.reload()
            }
        },
        '$store.state.errorMessage':
        {
            handler(newVal, oldVal)
            {
                this.$notify.warning({ title: newVal.title, message: newVal.message})
            },
            deep: true
        }
        // errorMessage:
        // {
        //     handler(newVal, oldVal)
        //     {
        //         console.log(newVal)
        //         this.$notify.warning({ title: newVal.title, message: newVal.message})
        //     },
        //     deep: true
        // },
    },
    methods:
    {
        handle(index)
        {
            if(index == 'logout')
            {
                location.reload()
            }
        },
        async get_token()
        {
            await fetch("http://10.11.0.156:8529/_open/auth",
            {
                method: 'POST',
                body: JSON.stringify({ username: "171104", password: "171104", })
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["error"])
                {
                    throw response["errorMessage"]
                }
                this.$store.commit('update_token', 'Bearer ' + response["jwt"])
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Server資料庫取得token異常', message: err})
            })
        },
    }
  }
</script>