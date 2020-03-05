<template>
    <el-container>
        <el-header height="60px" />
        <el-main  v-loading="loading">
            <el-row :gutter="20">
                <!--eslint-disable-next-line-->
                <div v-for="(item , index) in ppr_data" :key="index">
                    <el-col :span="8">
                    <el-card class="box-card">
                    <div slot="header">
                        <center>{{item.name}}設定</center>
                    </div>
                    <el-row>
                        <el-switch  v-model="item.type" active-color="#13ce66" inactive-color="#1197d1"
                            active-text= "交流" inactive-text="直流" active-value="AC" inactive-value="DC">
                        </el-switch>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                        <span>正向電流:</span>
                        </el-col>
                        <el-col :span="16">
                        <el-tooltip class="item" effect="dark" content="只限輸入數字" placement="top">
                            <el-input v-model="item.forward_current"></el-input>
                        </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <span>正向電流時間:</span>
                        </el-col>
                        <el-col :span="16">
                            <el-tooltip class="item" effect="dark" content="預設為100" placement="top">
                                <el-slider v-model="item.forward_current_time" disabled show-input :min="0" :max="100" />
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                        <span>反向電流:</span>
                        </el-col>
                        <el-col :span="16">
                            <el-tooltip class="item" effect="dark" content="只限輸入數字" placement="top">
                                <el-input v-model="item.reverse_current" :disabled="item.type == 'DC'"></el-input>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <span>反向電流時間:</span>
                        </el-col>
                        <el-col :span="16">
                            <el-tooltip class="item" effect="dark" content="預設為5" placement="top">
                                <el-slider v-model="item.reverse_current_time" disabled show-input :min="0" :max="100" > </el-slider>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <span>電鍍時間(分鐘):</span>
                        </el-col>
                        <el-col :span="16">
                            <el-slider v-model="item.current_time" show-input :min="0" :max="600" > </el-slider>
                        </el-col>
                    </el-row>
                    </el-card>
                    </el-col>
                </div>
            </el-row>
            <el-col :span="8">
                <el-button type="primary" @click="storePPR">儲存</el-button>

                <el-button type="success" @click="startPPR">啟動</el-button>

                <el-button type="danger" @click="stopPPR">關閉</el-button>
            </el-col>
            <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
            <el-row>

            </el-row>
        </el-main>
    </el-container>
</template>

<script>
export default {
    name: 'PPR_DATA',
    data: function()
    {
        return  {
            img_uri: '@/assets/logo.png',
            activeIndex: '1',
            loading: false,
            ppr_data: [
            {
                name: "起始電鍍",
                type: "DC",
                forward_current: 10,
                forward_current_time: 100,
                reverse_current: 0,
                reverse_current_time: 0,
                current_time: 1,
            },
            {
                name: "第一段電流",
                type: "DC",
                forward_current: 10,
                forward_current_time: 100,
                reverse_current: 0,
                reverse_current_time: 0,
                current_time: 10
            }, 
            {
                name: "第二段電流",
                type: "AC",
                forward_current: 10,
                forward_current_time: 100,
                reverse_current: 0,
                reverse_current_time: 5,
                current_time: 10
            }, 
            {
                name: "第三段電流",
                type: "AC",
                forward_current: 10,
                forward_current_time: 100,
                reverse_current: 0,
                reverse_current_time: 5,
                current_time: 10
            },
            {
                name: "結束電鍍",
                type: "DC",
                forward_current: 10,
                forward_current_time: 100,
                reverse_current: 0,
                reverse_current_time: 0,
                current_time: 1,
            },
            ],

        }
    },
    computed:
    {

    },
    watch:
    {
        dialogVisible: false,
        
        ppr_data:
        {
            handler(newVal)
            {
                newVal.forEach(element =>
                {
                    if(element["type"] == "DC")
                    {
                        element["reverse_current"] = 0
                        element["reverse_current_time"] = 0
                    }
                    else
                    {
                        element["reverse_current_time"] = 5
                    }
                })
            },
            deep: true,
        },
    },
    methods:
    {
        async startPPR()
        {
            this.loading = true
            await  fetch('http://10.11.30.61:9999/api/startPPR', 
            {   method: 'POST',
                // body: JSON.stringify(this.ppr_data)
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                console.log(response)
                if("Exception" in response)
                {
                this.$notify({ title: "Host錯誤!", message: response["Exception"], type: "error"});
                }
                if("response" in response)
                {
                    if(response["response"])
                    {
                        this.$message({message: '啟動成功', type: 'success'});
                    }
                    else
                    {
                        this.$message({message: '啟動失敗', type: 'warning'});
                    }
                }
            })
            .catch(err =>
            {
                this.$notify({ title: "Client錯誤!", message: err, type: "error"});
            })
            .finally( () => 
            {   
                this.loading = false
            })
        },
        async storePPR()
        {
            for (let item of this.ppr_data)
            {
                item["forward_current"] = + item["forward_current"]
                item["reverse_current"] = + item["reverse_current"]
            }
            console.log(this.ppr_data)
            this.loading = true
            await  fetch('http://10.11.30.61:9999/api/storePPR', 
            {   method: 'POST',
                body: JSON.stringify(this.ppr_data)
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                // eslint-disable-next-line
                console.log(response)
                if("Exception" in response)
                {
                this.$notify({ title: "Host錯誤!", message: response["Exception"], type: "error"});
                }
                if("response" in response)
                {
                    if(response["response"])
                    {
                        this.$message({message: '儲存成功', type: 'success'});
                    }
                    else
                    {
                        this.$message({message: '儲存失敗', type: 'warning'});
                    }
                }
            })
            .catch(err =>
            {
                this.$notify({ title: "Client錯誤!", message: err, type: "error"});
            })
            .finally( () => 
            {   
                this.loading = false
            })
        },
        async stopPPR()
        {
            this.loading = true
            await this.$axios.post('http://10.11.30.61:9999/api/stopPPR')
            .then( res =>
            {
                let response = res.data
                if("Exception" in response)
                {
                    this.$notify({ title: "Host錯誤!", message: response["Exception"], type: "error"});
                }
                if("response" in response)
                {
                    if(response["response"])
                    {
                        this.$message({message: '關閉成功', type: 'success'});
                    }
                    else
                    {
                        this.$message({message: '關閉失敗', type: 'warning'});
                    }
                }
            })
            .catch(err =>
            {
                this.$notify({ title: "Client錯誤!", message: err, type: "error"});
            })
            .finally( () => 
            {   
                this.loading = false
            })
        }
    },
}
</script>

<style scoped>
  .el-row {
    margin-bottom: 40px;
  }
  .el-col {
    border-radius: 4px;
  }
</style>