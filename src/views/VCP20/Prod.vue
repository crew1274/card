<template>
    <el-container class="content">
        <el-header height="60px" />
        <el-main>
            <el-row :gutter="20">
                <el-steps :active="prod_step" finish-status="success" align-center>
                    <el-step title="步驟 1" description="檢查PLC、MES連線狀態"></el-step>
                    <el-step title="步驟 2" description="請對RFID讀取器感應員工識別證及工單並輸入製程序和片數"></el-step>
                    <el-step title="步驟 3" description="輸入及確認製程參數"></el-step>
                    <el-step title="步驟 4" description="參數寫入PLC"></el-step>
                    <el-step title="步驟 5" description="呼叫AGV"></el-step>
                </el-steps>
            </el-row>
            <el-row :gutter="20">
                <el-card>
                    <div slot="header">
                    <el-row :gutter="20">
                        <el-col :span="4">
                            <span>操作步驟:{{prod_step+1}}</span>
                        </el-col>
                        <el-col :span="4" :offset="4">
                            <el-button type="warning" @click="prod_previous">上一步</el-button>
                        </el-col>
                        <el-col :span="4">
                            <el-button type="primary" @click="prod_next">下一步</el-button>
                        </el-col>
                        <el-button style="float: right;" type="danger" @click="prod_cancel">取消</el-button>
                    </el-row>
                    </div>
                    <div v-loading="loading">
                        <div v-if="prod_step == 0">
                            <el-row :gutter="20">
                                <center>
                                    <el-button type="text" @click="prod_check">操作前點我檢查連線狀態</el-button>
                                </center>
                            </el-row>
                        </div>
                        <div v-else-if="prod_step == 1">
                            <el-row>
                                <center><h3>請輸入批號、工號及製程序</h3></center>
                            </el-row>
                            <el-row :gutter="20">
                                <el-col :span="24">
                                    <el-tooltip class="item" effect="dark" content="感應RFID可自動帶入" placement="top">
                                        <el-input v-model="LotNO" clearable>
                                            <template slot="prepend">批號:</template>
                                        </el-input>
                                    </el-tooltip>
                                </el-col>
                            </el-row>
                            <el-row :gutter="20">
                                <el-col :span="24">
                                    <el-tooltip class="item" effect="dark" content="感應RFID可自動帶入" placement="top">
                                        <el-input v-model="Operator" clearable>
                                            <template slot="prepend">工號:</template>
                                        </el-input>
                                    </el-tooltip>
                                </el-col>
                            </el-row>
                            <el-row :gutter="20">
                                <el-col :span="4">
                                    製程序:
                                </el-col>
                                <el-tooltip class="item" effect="dark" content="預設0即查詢當站參數" placement="top">
                                    <el-col :span="4">
                                        <el-input-number v-model="ProcSeq" :min="0" :max="200" label="製程序"  size="large" />
                                    </el-col>
                                </el-tooltip>
                            </el-row>
                        </div>
                        <!-- <div v-else-if="prod_step == 2">
                            <center><h3>確認批號資訊</h3></center>
                            <el-col :span="24">   
                                <el-card shadow="always" header="批號資訊">
                                    <el-row >
                                        <el-input v-model="lotdata.itemno" disabled>
                                            <template slot="prepend">料號:</template>
                                        </el-input>
                                    </el-row>
                                    <el-row >
                                        <el-input v-model="lotdata.itemver" clearable>
                                            <template slot="prepend">料號板次:</template>
                                        </el-input>
                                    </el-row>
                                    <el-row >
                                        <el-input v-model="lotdata.mfver" clearable>
                                            <template slot="prepend">製造板次:</template>
                                        </el-input>
                                    </el-row>
                                    <el-row >
                                        <el-input v-model="lotdata.no" clearable>
                                            <template slot="prepend">批號:</template>
                                        </el-input>
                                    </el-row>
                                    <el-row >
                                        <el-input v-model="lotdata.procseq" clearable>
                                            <template slot="prepend">製程序:</template>
                                        </el-input>
                                    </el-row>
                                </el-card>
                            </el-col>
                        </div>   -->
                        <div v-else-if="prod_step == 2">
                            <el-row>
                                {{procdata.procname}}
                            </el-row>
                            <!-- <el-row>
                                <center>選擇PPR電鍍或DC電鍍</center>  
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
                                                    <el-input-number v-model="ppr_data.RD05M134" step="0.1" size="large" />
                                                </el-form-item>
                                            </el-tooltip>
                                            <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                                <el-form-item label="最小孔徑(mil):">
                                                    <el-input-number v-model="ppr_data.RD05M146" size="large" />
                                                </el-form-item>
                                            </el-tooltip>
                                            <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left"> 
                                                <el-form-item label="當站板厚(mm):">
                                                    <el-input-number v-model="ppr_data.RD05M136" step="0.1" size="large" />
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
                                <el-form ref="form" :model="ppr_data">
                                    <el-tooltip class="item" effect="dark" content="此參數影響推桿位置" placement="right">
                                        <el-form-item label="板寬(mm):">
                                            <el-input-number v-model="ppr_data.RD05M48" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響遮板高度" placement="right">
                                        <el-form-item label="板長(mm):">
                                            <el-input-number v-model="ppr_data.RD05M47" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍時間" placement="right">
                                        <el-form-item label="電鍍時間(分鐘):">
                                            <el-input-number v-model="ppr_data.PlatingTime" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-form-item label="上料片數(不包含Dummy):">
                                        <el-tooltip class="item" effect="dark" content="範圍(1~6)" placement="top">
                                            <el-input-number v-model="ppr_data.PlatingPnl" :min="1" :max="6" size="large" />
                                        </el-tooltip>
                                    </el-form-item>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="right">
                                        <el-form-item label="電鍍面積(SQIN):">
                                            <el-input-number v-model="ppr_data.RD05M49" size="large" />
                                        </el-form-item>
                                    </el-tooltip>
                                    <el-form-item label="備註:">
                                        <el-checkbox-group v-model="noteList">
                                            <el-checkbox label="重工"></el-checkbox>
                                        </el-checkbox-group>
                                    </el-form-item>
                                    <el-form-item label="是否自動上下料:">
                                        <el-checkbox-group v-model="noteList">
                                            <el-checkbox label="重工"></el-checkbox>
                                        </el-checkbox-group>
                                    </el-form-item>                             
                                    電鍍電流計算公式:
                                    [電鍍面積(SQIN){{ppr_data.RD05M49}} / 144 / 2 * 8(ASF) * 片數{{ppr_data.PlatingPnl}} ] + 10(Dummy) = {{this.ppr_result[1].P_PlatingAmp}}
                                </el-form>
                            </div>
                            
                            <el-divider content-position="left">飛靶編號及刀數可於上料後於生產履歷再修改</el-divider> 
                            <div>
                                <el-row :gutter="10">
                                    <el-card>
                                        <div slot="header" class="clearfix">
                                            飛靶編號(面對設備 從裡面到外面)
                                        </div>
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
                                    </el-card>
                                </el-row>
                            </div>
                            <div>
                                <el-row :gutter="10">
                                    <el-card>
                                        <div slot="header" class="clearfix">
                                            刀數(面對設備 從裡面到外面)
                                        </div>
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
                                    </el-card>
                                </el-row>
                            </div>
                            <el-divider />
                            <el-col :span="24">
                                <el-table :data="ppr_result" style="font-size: 20px; width: 100%">
                                    <el-table-column prop="name" label="" width="180" />
                                    <el-table-column prop="PlatingTime" label="電鍍時間 (min)" width="180" />
                                    <el-table-column prop="P_PlatingAmp" label="正向電流 (A)" width="180" />
                                    <el-table-column prop="N_PlatingAmp" label="負向電流 (A)" width="180" />
                                </el-table>  
                            </el-col>
                        </div>
                        <div v-else-if="prod_step == 3">
                            <el-row /><el-row /><el-row>
                            <el-col :span="4" :offset="10">
                                <el-button @click="prod_work" type="primary" icon="el-icon-edit">參數寫入PLC</el-button>
                            </el-col>
                            </el-row><el-row /><el-row /><el-row>
                            <el-col :span="4" :offset="10">
                                <el-button @click="prod_confrim" type="primary" icon="el-icon-switch-button">啟動自動模式</el-button>
                            </el-col>
                            </el-row><el-row /><el-row />
                            <el-col :span="4" :offset="10">
                                <el-button type="primary" @click="storeDialogFormVisible = true" icon="el-icon-upload2">儲存參數</el-button>
                            </el-col>
                        </div>
                        <div v-else-if="prod_step == 4">
                            <el-row>
                                <el-col :span="4" :offset="10">
                                    <el-button @click="callAGV" type="primary" icon="el-icon-phone">
                                        呼叫AGV
                                    </el-button>
                                </el-col>
                            </el-row><el-row /><el-row />
                        </div>
                        <div v-else-if="prod_step == 5">
                            <el-row />
                                <center><h3>操作完成，按下一步跳轉到首頁</h3></center>
                            <el-row />
                        </div>
                    </div>   
                </el-card>
            </el-row>
            <el-dialog title="提示" :visible.sync="dialogVisible" width="50%">
                <ul v-for="(item, index) in ProdCheckList" :key="index">
                    <el-checkbox v-model="item.status" :label="item.label" border></el-checkbox>
                </ul>
                <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" type="primary" >確定</el-button>
                </span>
            </el-dialog>
            <el-dialog title="保留參數紀錄" :visible.sync="storeDialogFormVisible">
                <el-form>
                    <el-tooltip class="item" effect="dark" content="名稱不可重複" placement="left">
                        <el-form-item label="幫參數取個名字吧:">
                        <el-input v-model="recipe_name"></el-input>
                        </el-form-item>
                    </el-tooltip>
                    <el-button type="primary" @click="generateRandom">採用預設(料號+批號+製程序)</el-button>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="storeDialogFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="RecipeStore">儲存</el-button>
                </div>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script>
import X2JS from 'x2js'

export default {
    data: function()
    {
        return {
            recipe_name: "",
            storeDialogFormVisible: false,
            dialogVisible: false,
            ProdCheckList: [ {"key": "EDGE", "status": false, "label": "檢查Edge連線"}, {"key": "RFID", "status": false, "label": "檢查RFID連線"},
                {"key": "PLC", "status": false, "label": "檢查PLC連線"}, {"key": "MES","status": false, "label": "檢查MES連線"} ,{"key": "MES","status": false, "label": "檢查PPR設備連線"}],  
            LotNO: '2019090191-1-1-1',
            Operator: '2019090191-1-1-1',
            ProcSeq: 17,
            loading: false,
            prod_step: 0,
            noteList: [],
            payload:
            {
                mfdata:
                {
                    lotdata:
                    {
                        no: null,
                        procseq: null
                    }
                }
            },
            lotdata:
            {
                itemno: null,
                itemver: null,
                mfver: null,
                no: null,
                procseq: null,
            },
            procdata:
            {
                procname: null,
                procprams: [],
            },
            ppr_data:
            {
                RD05M134 : "", //成品孔銅
                RD05M146 : "",  //最小孔徑
                RD05M136 : "",// 板厚
                RD05M49 : "", // 鍍銅面積
                PlatingPnl : 1, //生產片數
                RD05M47 : "",  //長
                RD05M48 : "",  //寬
                PlatingTime : "", //電鍍時間(DC用)
                PlatingTime_1_offset : "", //電鍍時間(AC用)
                PlatingTime_2_offset : "", //電鍍時間(AC用)
                PlatingTime_3_offset : "", //電鍍時間(AC用)
                PPR_or_DC: "DC",
                carrier: [],
                cut_tag:[],
            },

        }
    },
    watch:
    {
        getWSmessage(value)
        {
            if(this.prod_step == 1)
            {
                let payload = value["payload"]
                if("Operator" in payload)
                {
                    this.$message({ message: "RFID讀取到工號:"+payload["Operator"], type: "info"})
                    this.Operator = payload["Operator"]
                }
                else if("LotNO" in payload)
                {
                    this.$message({ message: "RFID讀取到工單:"+payload["LotNO"], type: "info"})
                    this.LotNO = payload["LotNO"]
                }
            }
        },
    },
    computed:
    {
        getWSmessage()
        {
            return this.$store.state._ws_back
        },
        RD05M134()
        {
            return +this.ppr_data.RD05M134
        },
        RD05M146()
        {
            return +this.ppr_data.RD05M146
        },
        RD05M136()
        {
            return +this.ppr_data.RD05M136
        },
        RD05M49()
        {
            return +this.ppr_data.RD05M49
        },        
        RD05M47()
        {
            return +this.ppr_data.RD05M47
        },
        PlatingPnl()
        {
            return +this.ppr_data.PlatingPnl
        },
        ASF()
        {
            return 12
        },
        SQIN()
        {
            return (Number(this.RD05M49) / 2 * this.PlatingPnl)
        },
        SQFT()
        {
            return (Number(this.SQIN) * 0.006944)
        },
        SQFT_Dummy()
        {
            return (2 * Number(this.RD05M47) * 0.00328 * 230 * 0.00328)
        },
        RD05M136_Compensation() //當站板厚補償值
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

        RD05M145_Compensation() //當站孔徑補償值
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
            return ppr_result_convert
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
                    "PlatingTime" : PlatingTime < 0 ? 0: PlatingTime ,
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
    },
    methods:
    {
        prod_previous()
        {
            if(this.prod_step >= 1)
            {
                this.prod_step = this.prod_step - 1
            }
        },
        prod_cancel()
        {
          this.prod_step = 0
          this.loading = false
        },
        cleanData()
        {
            Object.keys(this.lotdata).forEach( key =>
            {
                this.lotdata[key] = null
            })
            Object.keys(this.procdata).forEach( key =>
            {
                this.procdata[key] = null
            })
            Object.keys(this.ppr_data).forEach( key =>
            {
                this.procdata[key] = null
            })
        },
        async getRD05M136(lotdata)
        {
            let RD05M136 = 0
            // console.log(lotdata)
            await fetch("http://10.11.30.61:9999/api/getRD05M136", {method: 'POST', body: JSON.stringify(lotdata)})
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                RD05M136 = response["result"]
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'MES查無板厚資訊', message: err})
            })
            return RD05M136
        },
         
        async getRecipe()
        {
            this.payload["mfdata"]["lotdata"]["no"] = this.LotNO
            if(this.ProcSeq == 0)
            {
                this.payload["mfdata"]["lotdata"]["procseq"] = null
            }
            else
            {
                this.payload["mfdata"]["lotdata"]["procseq"] = this.ProcSeq
            }
            let x2js = new X2JS()
            x2js.js2xml(this.payload)
            return await this.$axios({ method: 'get', url: 'http://mesap/mesws_chpt/wsmes/wsmes.asmx/GetParameter?InXml='+x2js.js2xml(this.payload)})
            .then( response =>
            {
                let res = response["data"]
                res = x2js.xml2js(res)
                res = x2js.xml2js(res["string"]["__text"])
                // console.log(Object.keys(res))
                if(! Object.keys(res).includes("mfdata"))
                {
                    throw "參數返回格式不符合預期"
                }
                if(res["mfdata"]["exception"])
                {
                    throw res["mfdata"]["exception"]
                }
                this.lotdata = res["mfdata"]["lotdata"]
                this.procdata = res["mfdata"]["procdata"]
                this.$message({ message: "成功取得製程參數，如有缺少參數請手動填入", type: "success"})
                return true
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'MES回應異常', message: err})
                return false
            })
        },
        prod_check()
        {
            this.dialogVisible = true;
            fetch('http://10.11.30.61:9999/api/prod/check', {method: 'GET' })
            .then( response => {return response.json()})
            .then( response =>
            {
                for (let i=0; i<this.ProdCheckList.length; i++)
                {
                    if(this.ProdCheckList[i]["key"] in response["check"])
                    {
                        this.ProdCheckList[i]["status"] = response["check"][this.ProdCheckList[i]["key"]]
                    }
                }
            })
            .catch( err =>
            {
                this.$message({ message: err, type: "error"})
            })
        },
        async prod_next()
        {
            this.loading = true
            if(this.prod_step == 1)
            {
                if(this.LotNO == "" || this.Operator == "")
                {
                    this.$notify.warning({ message: "批號或工號不能為空!"})
                    this.prod_step = this.prod_step - 1
                }
                else
                {
                    if(await this.getRecipe())
                    {
                        this.ppr_data.RD05M136 = await this.getRD05M136(this.lotdata)
                        for(let item of this.procdata.procprams.procpram)
                        {
                            if(item.procprammes in this.ppr_data)
                            {
                                this.ppr_data[item.procprammes] = +item.procvalue
                            }
                        }
                    }
                    else
                    {
                        this.$message({ message: "MES回應異常", type: "error"})
                    }
                }
            }
            this.prod_step = this.prod_step + 1
            if(this.prod_step == 6)
            {
                this.prod_step = 0
            }
            this.loading = false
        },
        async prod_confrim()
        {
            this.loading = true
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
                this.loading = false
            })
        },
        async RecipeStore()
        {
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-30/_api/document/PH",
                method: "POST",
                payload:
                {
                    _key: this.recipe_name,
                    ppr_data: this.ppr_data,
                    lotdata: this.lotdata,
                    ppr_result: this.ppr_result_convert, 
                },
            })
            if(! response )
            {
                this.$message({ message: "儲存成功", type: "success"})
            }
        },  
        async prod_work()
        {
            this.loading = true
            // console.log(this.ppr_result_convert)
            for(let i = 3; i>1; i--)
            {
                // console.log(this.ppr_result_convert[i]["current_time"])
                if( this.ppr_result_convert[i]["current_time"] > 0 && this.ppr_result_convert[i-1]["current_time"] == 0)
                {
                    this.$message({ message: "電鍍第"+(i-1).toString()+"段電鍍時間不能為0", type: "warning"})
                    this.loading = false
                    return 
                }  
            }
            this.lotdata["source"] = "runcard"
            await fetch("http://10.11.30.61:9999/api/PLC/temp",
            {   method: 'POST',
                body: JSON.stringify({
                    ppr_result: this.ppr_result_convert, 
                    ppr_data: this.ppr_data,
                    lotdata: this.lotdata,
                    procdata: this.procdata,
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
                this.loading = false
            })
        },
        generateRandom()
        {
            // this.recipe_name = this.lotdata.itemno + "_" + Math.random().toString(36).substring(4)
            this.recipe_name = this.lotdata.itemno + "_" + this.LotNO + "_" + this.ProcSeq
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
        async callAGV()
        {
            await fetch("http://10.11.30.61:9999/api/CallAGV", {method: 'POST'})
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                response["response"] ? this.$message({ message: "呼叫AGV成功", type: "success"}) : this.$message({ message: "呼叫AGV失敗", type: "warning"})
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge異常回報', message: err})
            })
            .finally( () => {})
        }
    }
}
</script>

<style scoped>
.el-row
{
    margin-bottom: 20px;
}
.content
{
    font-size: 24px;
}
</style>