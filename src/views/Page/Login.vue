<template>
    <div class="login-box">
        <el-card>
            <div slot="header" class="title">
                <center>3F 產線設備入口</center>
            </div>
            <el-row>
                <el-col :span="8">
                    帳號:
                </el-col>
                <el-col :span="16">
                    <el-input v-model="user" />
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    密碼:
                </el-col>
                <el-col :span="16">
                    <el-input v-model="password" show-password/>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    連線設備:
                </el-col>
                <el-col :span="16">
                    <el-radio v-model="machine" label="VCP-20" class="content">VCP-20</el-radio>
                    <el-radio v-model="machine" label="VCP-30" class="content">VCP-30</el-radio>
                    <el-radio v-model="machine" label="VCP-40" class="content">VCP-40</el-radio>
                </el-col>
            </el-row>
            <el-row>
                <el-button style="width:100%;" type="primary" @click="login" icon="el-icon-eleme" >連線</el-button>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="12">
                    <el-button style="width:100%;" type="info" @click="refresh" icon="el-icon-refresh-left" >重新整理</el-button>
                </el-col>
                <el-col :span="12">
                    <el-button style="width:100%;" type="danger" @click="close" icon="el-icon-close" >關閉程式</el-button>
                </el-col>            
            </el-row>
        </el-card>
        <div class="c">{{version}}</div>
    </div>
    
</template>


<script>
// import keyboard from "@/components/keyboard"

    export default {
        name: "login",
        data:  function()
        {   
            return {
                user: 'watcher',
                password: 'watcher',
                machine: "VCP-20"
            }
        },
        mounted()
        {
        },
        computed:
        {
            version()
            {
                return "Ver. " + this.$store.state.packageVersion
            },
            _ws_isLogin: function()
            {
                return this.$store.state._ws_isLogin
            },
            _ws_back: function()
            {
                return this.$store.state._ws_back
            }
        },
        watch:
        {
            _ws_isLogin: function (_ws_isLogin)
            {
                if(_ws_isLogin)
                {
                    this.$router.push(this.machine)
                }
            },
            _ws_back: function(_ws_back)
            {
                if("isAllowed" in _ws_back)
                {
                    if(_ws_back["isAllowed"])
                    {
                        this.$notify({ title: '連線成功', message: _ws_back["MSG"], type: 'success' }) 
                        this.$store.commit('login')
                    }
                    else
                    {
                        this.$notify({  title: '連線失敗', message: _ws_back["toast"], type: 'error' })
                    }
                }
            }
            
        },
        methods: 
        {   
            login()
            {
                let user = this.user 
                let password = this.password
                let machine = this.machine
                this.$store.dispatch('_ws_login', {"User": user, "Password": "password", "machine": machine})
            },
            close()
            {
                let w = require('electron').remote.getCurrentWindow()
                w.close()
            },
            refresh()
            {
                location.reload()
            },
        }
    }
</script>

<style>
    .c{
    position: fixed;
    bottom: 10px;
    right: 15px;
    background: #8EB9A8;
    }
    .login-box
    {
        margin-top:10%;
        margin-left:30%;
        margin-right:30%;
    }
    .el-row
    {
        margin-bottom: 20px;
    }
    #login
    {
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微軟雅黑",Arial,sans-serif;
        font-size: 24px;
    }
    .title
    {
        font-size: 48px;
    }
    .content
    {
        font-size: 24px;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微軟雅黑",Arial,sans-serif;
    }
</style>