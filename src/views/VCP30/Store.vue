<template>
    <el-container>
        <el-header height="60px" >
            <center>已儲存歷史參數列表</center>
        </el-header>
        <el-main v-loading="loading">
            <el-table :data="show_data.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%">
                <el-table-column label="名稱" prop="name" />
                <el-table-column align="right">
                <template slot="header">
                    <el-input v-model="search" size="mini" placeholder="搜尋" clearable/>
                </template>
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" @click="handleCheck(scope.row)">查看詳細</el-button>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.row)">刪除</el-button>
                </template>
                </el-table-column>
            </el-table>
            <el-dialog title="確定要刪除參數?" :visible.sync="deleteDialogVisible" width="50%" v-loading="loading">
                <span slot="footer" class="dialog-footer">
                    <el-button type="info" @click="deleteDialogVisible = false">我按錯了</el-button>
                    <el-button type="danger" @click="confrimDelete">確定</el-button>
                </span>
            </el-dialog>
            <el-dialog title="參數詳細資訊" :visible.sync="recipeDialogVisible" width="80%">
                <!--  <el-row>
                    <h3><center>選擇PPR電鍍或DC電鍍</center></h3>
                </el-row>
                <el-row>       
                    <el-col :span="6" :offset="6">
                        <el-radio v-model="ppr_data.PPR_or_DC" :label="'PPR'" border @change="PPR_or_DC_confirm"><h2>PPR電鍍</h2></el-radio>
                    </el-col>
                    <el-col :span="6" :offset="6">
                        <el-radio v-model="ppr_data.PPR_or_DC" :label="'DC'" border @change="PPR_or_DC_confirm"><h2>DC電鍍</h2></el-radio>
                    </el-col>                  
                </el-row>
                <el-row>
                    <el-divider />
                </el-row> -->
                <div v-if="ppr_data.PPR_or_DC == 'PPR'">
                    <el-row>
                        <el-form ref="form" :model="ppr_data" size="medium">
                            <el-row>
                                <el-col :span="12">
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                        <el-form-item label="孔銅需求(mil):">
                                            <el-input-number v-model="ppr_data.RD05M134" :step="0.1" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                        <el-form-item label="最小孔徑(mil):">
                                            <el-input-number v-model="ppr_data.RD05M146" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left"> 
                                        <el-form-item label="當站板厚(mm):">
                                            <el-input-number v-model="ppr_data.RD05M136" :step="0.1" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">                                            
                                        <el-form-item label="面積(SQIN):">
                                            <el-input-number v-model="ppr_data.RD05M49" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響遮板高度及電鍍電流" placement="left">                                            
                                        <el-form-item label="板長(mm):">
                                            <el-input-number v-model="ppr_data.RD05M47" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響推桿位置" placement="left">
                                        <el-form-item label="板寬(mm):">
                                            <el-input-number v-model="ppr_data.RD05M48" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-form-item label="上料片數(不包含Dummy):">
                                        <el-tooltip class="item" effect="dark" content="範圍(1~6)" placement="left">
                                            <el-input-number v-model="ppr_data.PlatingPnl" :min="1" :max="6" size="large" />
                                        </el-tooltip>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="電鍍第一段補償時間:">
                                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍第一段電鍍時間" placement="left">
                                            <el-input-number v-model="ppr_data.PlatingTime_1_offset" :min="-180" :max="180" size="large" />
                                        </el-tooltip>
                                    </el-form-item>
                                    <el-form-item label="電鍍第二段補償時間:">
                                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍第二段電鍍時間" placement="left">
                                            <el-input-number v-model="ppr_data.PlatingTime_2_offset" :min="-180" :max="180" size="large" />
                                        </el-tooltip>
                                    </el-form-item>
                                    <el-form-item label="電鍍第三段補償時間:">
                                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍第三段電鍍時間" placement="left">
                                            <el-input-number v-model="ppr_data.PlatingTime_3_offset" :min="-180" :max="180" size="large" />
                                        </el-tooltip>
                                    </el-form-item>
                                    <el-form-item label="備註:">
                                        <el-checkbox-group v-model="noteList">
                                            <el-checkbox label="重工"></el-checkbox>
                                        </el-checkbox-group>
                                    </el-form-item>  
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-row>
                </div>
                <div v-else-if="ppr_data.PPR_or_DC == 'DC'">
                    <el-form ref="form" :model="ppr_data" size="medium">
                        <el-tooltip class="item" effect="dark" content="此參數影響推桿位置" placement="left">
                            <el-form-item label="板寬(mm):">
                                <el-input-number v-model="ppr_data.RD05M48" size="large" />
                            </el-form-item>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="此參數影響遮板高度" placement="left">
                            <el-form-item label="板長(mm):">
                                <el-input-number v-model="ppr_data.RD05M47" size="large" />
                            </el-form-item>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍時間" placement="left">
                            <el-form-item label="電鍍時間(分鐘):">
                                <el-input-number v-model="ppr_data.PlatingTime" size="large" />
                            </el-form-item>
                        </el-tooltip>
                        <el-form-item label="上料片數(不包含Dummy):">
                            <el-tooltip class="item" effect="dark" content="範圍(1~6)" placement="top">
                                <el-input-number v-model="ppr_data.PlatingPnl" :min="1" :max="6" size="large" />
                            </el-tooltip>
                        </el-form-item>
                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="leftyarbn ">
                            <el-form-item label="電鍍面積(SQIN):">
                                <el-input-number v-model="ppr_data.RD05M49" size="large" />
                            </el-form-item>
                        </el-tooltip> 
                        <el-form-item label="備註:">
                            <el-checkbox-group v-model="noteList">
                                <el-checkbox label="重工"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>  
                        <h4>                                  
                        電鍍電流計算公式:
                        [電鍍面積(SQIN){{ppr_data.RD05M49}} / 144 / 2 * 8(ASF) * 片數{{ppr_data.PlatingPnl}} ] + 10(Dummy) = {{ppr_result[1].P_PlatingAmp}}</h4>
                    </el-form>
                </div>
                <div v-if="ppr_data.carrier">
                    <el-row :gutter="10">
                        <h5>飛靶編號(面對設備 從裡面到外面)</h5>
                    </el-row>
                    <el-row :gutter="10">
                        <el-col :span="3">
                            <el-input placeholder="DUMMY" disabled clearable />
                        </el-col>
                        <div v-for="(key, index) in ppr_data.PlatingPnl" v-bind:key="key">
                            <el-col :span="3">
                                <el-input v-model="ppr_data.carrier[index]" clearable />
                            </el-col>
                        </div>
                        <el-col :span="3">
                            <el-input placeholder="DUMMY" disabled clearable />
                        </el-col>
                    </el-row>
                </div>
                <div v-if="ppr_data.cut_tag">
                    <el-row :gutter="10">
                        <h5>刀數(面對設備 從裡面到外面)</h5>
                    </el-row>
                    <el-row :gutter="10">
                        <el-col :span="3">
                            <el-input placeholder="DUMMY" disabled clearable />
                        </el-col>
                        <div v-for="(key, index) in ppr_data.PlatingPnl" v-bind:key="key">
                            <el-col :span="3">
                                <el-input v-model="ppr_data.cut_tag[index]" clearable />
                            </el-col>
                        </div>
                        <el-col :span="3">
                            <el-input placeholder="DUMMY" disabled clearable />
                        </el-col>
                    </el-row>
                </div>
                <el-divider />
                <el-row>
                    <el-col :span="24">
                        <el-table :data="ppr_result" style="font-size: 20px; width: 100%">
                            <el-table-column prop="name" label="" width="180" />
                            <el-table-column prop="PlatingTime" label="電鍍時間 (min)" width="180" />
                            <el-table-column prop="P_PlatingAmp" label="正向電流 (A)" width="180" />
                            <el-table-column prop="N_PlatingAmp" label="負向電流 (A)" width="180" />
                        </el-table>  
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="4" :offset="6">
                        <el-button @click="prod_work" type="primary" icon="el-icon-edit">參數寫入PLC</el-button>
                    </el-col>
                    <el-col :span="4" :offset="6">
                        <el-button @click="prod_confrim" type="primary" icon="el-icon-switch-button">啟動自動模式</el-button>
                    </el-col>
                </el-row>
            </el-dialog>
        </el-main>
  </el-container>
</template>

<script>
    export default {
    async created()
    {
        await this.CheckData()
    },
    data: function()
    {
        return {
            loading: false,
            search: "",
            result : [],
            noteList: [],
            deleteDialogVisible: false,
            recipeDialogVisible: false,
            delete_name: "",
            ppr_data: "",
            lotdata: "",
        }
    },
    computed:
    {
        token()
        {
            return this.$store.state.token
        },
        RD05M134:function ()
        {
            return +this.ppr_data.RD05M134
        },
        RD05M146:function ()
        {
            return +this.ppr_data.RD05M146
        },
        RD05M136:function ()
        {
            return +this.ppr_data.RD05M136
        },
        RD05M49:function ()
        {
            return +this.ppr_data.RD05M49
        },        
        RD05M47:function ()
        {
            return +this.ppr_data.RD05M47
        },
        PlatingPnl: function()
        {
            return +this.ppr_data.PlatingPnl
        },

        ASF:function ()
        {
            return 12
        },

        SQIN:function ()
        {
            return (Number(this.RD05M49) / 2 * this.PlatingPnl)
        },

        SQFT:function ()
        {
            return (Number(this.SQIN) * 0.006944)
        },

        SQFT_Dummy:function ()
        {
            return (2 * Number(this.RD05M47) * 0.00328 * 230 * 0.00328)
        },

        RD05M136_Compensation: function() //當站板厚補償值
        {
        if(Number(this.RD05M136) <= 5)
        {
            return 1
        }
        else if(Number(this.RD05M136) > 5 && Number(this.RD05M136) <= 7)
        {
            return 1.1
        }
        else if(Number(this.RD05M136) > 7 && Number(this.RD05M136) <= 9)
        {
            return 1.2
        }
        else if(Number(this.RD05M136) > 9 && Number(this.RD05M136) <= 10)
        {
            return 1.3
        }
        else if(Number(this.RD05M136) > 10)
        {
            return 1.4
        }
        else
        {
            return NaN
        }
        },

        RD05M145_Compensation: function() //當站孔徑補償值
        {
            if(Number(this.RD05M146) <= 5)
            {
                return 1
            }
            else if(Number(this.RD05M146) > 5 && Number(this.RD05M146) <= 6)
            {
                return 1
            }
            else if(Number(this.RD05M146) > 7 && Number(this.RD05M146) <= 8)
            {
                return 1
            }
            else if(Number(this.RD05M146) > 8)
            {
                return 1
            }
            else
            {
                return NaN
            }
        },
        show_data:function ()
        {
            let arr = []
            this.result.forEach((element) =>
            {
                arr.push({ name: element.split("/")[6] })
            })
            return arr
        },
        ppr_result()
        {
            let result = []
            let PlatingTime = 0
            let P_PlatingAmp = 0
            let N_PlatingAmp = 0
            let name = ''
            let times = []
            if(this.ppr_data.PPR_or_DC == "PPR")
            {
                times = [0, 1, 2, 3, 4]
            }
            else
            {
                times = [0, 1, 2]
            }
            for(let i in times)
            {
                if(i == 0 || i == times.length-1) //結束 and 起始
                {
                    i == 0? name = '起始電鍍' : name = '結束電鍍'
                    PlatingTime = 0
                    P_PlatingAmp = 10
                    N_PlatingAmp = 0
                }
                else
                {
                    if(this.ppr_data.PPR_or_DC == "DC")
                    {
                        name = '主電鍍'
                        PlatingTime = this.ppr_data.PlatingTime
                        let PlatingAmp = this.ppr_data.RD05M49 / 144 / 2 * 8
                        P_PlatingAmp = (PlatingAmp * this.ppr_data.PlatingPnl) + 10
                        N_PlatingAmp = 0
                    }
                    else
                    {
                        if(i == 1) // 第一段
                        {
                            name = '第一段'
                            if(this.RD05M134 <= 0)
                            {
                                PlatingTime = 0 + this.ppr_data.PlatingTime_1_offset
                            }
                            else if(this.RD05M134 <= 0.6 && this.RD05M134 > 0)
                            {
                                PlatingTime = 10 + this.ppr_data.PlatingTime_1_offset
                            }
                            else if(this.RD05M134 > 0.6 && this.RD05M134 < 0.8)
                            {
                                PlatingTime = 10 + this.ppr_data.PlatingTime_1_offset
                            }
                            else if(this.RD05M134 >= 0.8 && this.RD05M134 <= 1)
                            {
                                PlatingTime = 10 + this.ppr_data.PlatingTime_1_offset
                            }
                            else if(this.RD05M134 > 1.0)
                            {
                                PlatingTime = "通知工程人員確認"
                            }
                            else
                            {
                                PlatingTime = NaN
                            }
                            P_PlatingAmp = this.ASF * (this.SQFT + this.SQFT_Dummy)
                            N_PlatingAmp = 0
                        }
                        else if(i == 2) // 第二段
                        {
                            name = '第二段'
                            if(this.RD05M134 <= 0)
                            {
                                PlatingTime = 0
                            }
                            else if(this.RD05M134 <= 0.6 && this.RD05M134 > 0)
                            {
                                PlatingTime = 120 * this.RD05M136_Compensation * this.RD05M145_Compensation + this.ppr_data.PlatingTime_2_offset
                            }
                            else if(this.RD05M134 > 0.6 && this.RD05M134 < 0.8)
                            {
                                PlatingTime = 140 * this.RD05M136_Compensation * this.RD05M145_Compensation + this.ppr_data.PlatingTime_2_offset
                            }
                            else if(this.RD05M134 >= 0.8 && this.RD05M134 <= 1)
                            {
                                PlatingTime = 150 * this.RD05M136_Compensation * this.RD05M145_Compensation + this.ppr_data.PlatingTime_2_offset
                            }
                            else if(this.RD05M134 > 1)
                            {
                                PlatingTime = "通知工程人員確認"
                            }
                            else 
                            {
                                PlatingTime = NaN
                            }
                            P_PlatingAmp = this.ASF * (this.SQFT + this.SQFT_Dummy)
                            N_PlatingAmp = P_PlatingAmp * - 3.5
                        }
                        else if(i == 3) // 第三段
                        {
                            name = '第三段'
                            if(this.RD05M134 <= 0)
                            {
                                PlatingTime = 0 + this.ppr_data.PlatingTime_3_offset 
                            }
                            else if(this.RD05M134 <= 0.6 && this.RD05M134 > 0)
                            {
                                PlatingTime = 30 + this.ppr_data.PlatingTime_3_offset 
                            }
                            else if(this.RD05M134 > 0.6 && this.RD05M134 < 0.8)
                            {
                                PlatingTime = 30 + this.ppr_data.PlatingTime_3_offset 
                            }
                            else if(this.RD05M134 >= 0.8 && this.RD05M134 <= 1)
                            {
                                PlatingTime = 90 + this.ppr_data.PlatingTime_3_offset 
                            }
                            else if(this.RD05M134 > 1)
                            {
                                PlatingTime = "通知工程人員確認"
                            }
                            else 
                            {
                                PlatingTime = NaN
                            }
                            P_PlatingAmp = this.ASF * (this.SQFT + this.SQFT_Dummy)
                            N_PlatingAmp = P_PlatingAmp * -1
                        }
                    }
                }
                result[i] = 
                {
                    "name" : name,
                    "PlatingTime" : PlatingTime < 0 ? 0: PlatingTime,
                    "P_PlatingAmp": Math.round(P_PlatingAmp * 100) / 100 ,
                    "N_PlatingAmp": Math.round(N_PlatingAmp * 100) / 100 ,
                }
            }
            if(result.length < 5)
            {
                result[4] = result[2]
                result[2] =
                {
                    "name" : "",
                    "PlatingTime" : 0,
                    "P_PlatingAmp": 0 ,
                    "N_PlatingAmp": 0 ,
                }
                result[3] =
                {
                    "name" : "",
                    "PlatingTime" : 0,
                    "P_PlatingAmp": 0 ,
                    "N_PlatingAmp": 0 ,
                }
            }
            return result
        },
        ppr_result_convert()
        {
            let ppr_result_convert = []
            this.ppr_result.forEach((element) =>
            {
                let item = {
                    name: element.name,
                    type: element.N_PlatingAmp == 0 ? "DC" : "AC",
                    forward_current: element.P_PlatingAmp,
                    forward_current_time: 100,
                    reverse_current: element.N_PlatingAmp,
                    reverse_current_time: element.N_PlatingAmp == 0 ? 0: 5,
                    current_time: element.PlatingTime,
                }
                ppr_result_convert.push(item)
            })
            // ppr_result_convert.unshift(
            //     {
            //         name: "起始電流",
            //         type: "DC",
            //         forward_current: 10,
            //         forward_current_time: 100,
            //         reverse_current: 0,
            //         reverse_current_time: 0,
            //         current_time: 0,
            //     })  //起始電流
            // ppr_result_convert.push(
            //     {
            //         name: "結束電流",
            //         type: "DC",
            //         forward_current: 10,
            //         forward_current_time: 100,
            //         reverse_current: 0,
            //         reverse_current_time: 0,
            //         current_time: 0,
            //     }
            // )   //末端電流
            return ppr_result_convert
        },
    },
    methods: 
    {
        async CheckData()
        {
            await fetch("http://10.11.0.156:8529/_db/VCP-30/_api/simple/all-keys",
            {
                method: "PUT",
                headers: {
                'Accept': 'application/json',
                'Authorization': this.token,
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ collection: "PH", })
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["error"])
                {
                    throw response["errorMessage"]
                }
                this.result = response["result"]
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Server資料庫存取異常', message: err})
            })
        },
        async handleCheck(row)
        {
            await fetch("http://10.11.0.156:8529/_db/VCP-30/_api/document/PH/" + row["name"],
            {
                method: "GET",
                headers: {
                'Accept': 'application/json',
                'Authorization': this.token,
                'Content-Type': 'application/json'
                },
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["error"])
                {
                    throw response["errorMessage"]
                }
                this.ppr_data = response["ppr_data"]
                this.lotdata = response["lotdata"]
                this.lotdata["source"] = row["name"]
                this.recipeDialogVisible = true
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Server資料庫存取異常', message: err})
            })
        },
        handleDelete(row)
        {
            this.deleteDialogVisible = true
            this.delete_name = row["name"]
        },
        async prod_confrim()
        {
            const loading = this.$loading({
                lock: false,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            })
            await fetch("http://10.11.30.61:9999/api/PLC/prod", {method: 'POST',})
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                response["response"] ? this.$message({ message: "準備啟動", type: "success"}) : this.$message({ message: "啟動異常", type: "warning"})
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge異常回報', message: err})
            })
            .finally( () =>
            {
                loading.close()
            })
        },
        async prod_work()
        {
            const loading = this.$loading({
                lock: false,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            })
            for(let i = 3; i>1; i--)
            {
                if( this.ppr_result_convert[i]["current_time"] > 0 && this.ppr_result_convert[i-1]["current_time"] == 0)
                {
                    this.$message({ message: "電鍍第"+(i-1).toString()+"段電鍍時間不能為0", type: "warning"})
                    loading.close()
                    return 
                }  
            }
            await fetch("http://10.11.30.61:9999/api/PLC/temp",
            {   method: 'POST',
                body: JSON.stringify({
                    ppr_result: this.ppr_result_convert, 
                    ppr_data: this.ppr_data,
                    lotdata: this.lotdata,
                    noteList: this.noteList,
                })
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                response["response"] ? this.$message({ message: "寫入暫存區完成", type: "success"}) : this.$message({ message: "寫入暫存區錯誤", type: "warning"})
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge異常回報', message: err})
            })
            .finally( () =>
            {
                loading.close()
            })
        },
        async confrimDelete()
        {
            this.deleteDialogVisible = false
            await fetch("http://10.11.0.156:8529/_db/VCP-30/_api/document/PH/" + this.delete_name,
            {
                method: "DELETE",
                headers: {
                'Accept': 'application/json',
                'Authorization': this.token,
                'Content-Type': 'application/json'
                },
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                console.log(response)
                if(response["error"])
                {
                    throw response["errorMessage"]
                }
                this.$message({ message: "刪除成功", type: "success"})
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Server資料庫存取異常', message: err})
            })
            await this.CheckData()
        },
        openFullScreen()
        {
            const loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
            })
            setTimeout(() =>
            {loading.close() }, 2000)
        },
        PPR_or_DC_confirm()
        {
            this.$confirm('確認切換?')
            .then( () => {

            })
            .catch( () => {
                this.ppr_data.PPR_or_DC == "PPR" ? this.ppr_data.PPR_or_DC = "DC" : this.ppr_data.PPR_or_DC = "PPR"
            })
        },
    }
}
</script>

