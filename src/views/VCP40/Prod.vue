<template>
    <el-container class="content">
        <el-header height="60px" >
            <center>製程參數套用</center>
        </el-header>
        <el-main v-loading="loading" element-loading-text="拼命載入資料中"
        element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
            <el-row :gutter="20">
                <el-steps :active="prod_step" finish-status="success" align-center>
                    <el-step title="步驟 1" description="選擇參數來源"></el-step>
                    <el-step title="步驟 2" description="RFID讀取/選擇歷史參數"></el-step>
                    <el-step title="步驟 3" description="修改及確認製程參數"></el-step>
                    <el-step title="步驟 4" description="參數寫入PLC及呼叫AGV"></el-step>
                </el-steps>
            </el-row>
            <el-row :gutter="20">
                <el-card>
                    <div slot="header">
                    <el-row :gutter="20">
                        <el-col :span="4">
                            <span>步驟:{{prod_step+1}}</span>
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
                    <div v-if="prod_step == 0">
                        <center><h3>選擇參數來源</h3></center>
                        <el-row :gutter="20">
                            <el-col :span="14" :offset="10">
                                <el-radio v-model="source" label="warehouse" border>參數庫</el-radio>
                                <el-radio v-model="source" label="runcard" border>RunCard</el-radio>
                            </el-col>
                        </el-row>
                    </div>
                    <div v-else-if="prod_step == 1">
                        <div v-if="source == 'runcard'">
                            <el-row>
                                <center><h3>請輸入批號、工號及製程序</h3></center>
                            </el-row>
                            <el-row :gutter="10">
                                <el-col :span="20" :offset="4">
                                    <el-tooltip class="item" effect="dark" content="感應RFID可自動帶入" placement="top">
                                        <el-input v-model="LotNO" clearable>
                                            <template slot="prepend">批號:</template>
                                        </el-input>
                                    </el-tooltip>
                                </el-col>
                            </el-row>
                            <el-row :gutter="20">
                                <el-col :span="20" :offset="4">
                                    <el-tooltip class="item" effect="dark" content="感應RFID可自動帶入" placement="top">
                                        <el-input v-model="Operator" clearable>
                                            <template slot="prepend">工號:</template>
                                        </el-input>
                                    </el-tooltip>
                                </el-col>
                            </el-row>
                            <el-row :gutter="20">
                                <el-col :span="4" :offset="4">
                                    製程序:
                                </el-col>
                                <el-tooltip class="item" effect="dark" content="預設0即查詢當站參數" placement="top">
                                    <el-col :span="4">
                                        <el-input-number v-model="ProcSeq" :min="0" :max="200" label="製程序"  size="large" />
                                    </el-col>
                                </el-tooltip>
                            </el-row>
                        </div>
                        <div v-else>
                            <el-row>
                                <center><h3>請選擇歷史參數</h3></center>
                            </el-row>
                            <el-row>
                                <el-table :data="store_recipe" border :highlight-current-row="true" @current-change="handleCurrentChange">
                                    <el-table-column label="名稱" prop="name" />
                                </el-table>
                            </el-row>
                        </div>
                    </div>
                    <div v-else-if="prod_step == 2">
                        <el-row>
                            製程站點:{{procdata.procname}}
                        </el-row>
                        <el-row :gutter="10">
                            <el-col :span="6">
                                <el-button @click="prod_predict" type="primary" icon="el-icon-s-opportunity" :disabled="is_predictable">
                                    進行預測
                                </el-button>
                            </el-col>
                            <el-col :span="10">
                                <el-input placeholder="預測結果" v-model="predict_result">
                                    <template slot="append">分鐘</template>
                                </el-input>
                            </el-col>
                            <el-col :span="6">
                                <el-button @click="pick_up" type="primary" icon="el-icon-bottom" :disabled="is_pick_up">套用</el-button>
                            </el-col>
                        </el-row>
                        <el-divider />
                        <el-row>
                            <el-form ref="form" :model="ppr_data">
                                <el-tooltip class="item" effect="dark" content="如超過8mm無法使用自動上下料" placement="right">
                                    <el-form-item label="版厚(mm):">
                                        <el-input-number v-model="ppr_data.RD05M136" size="large" />
                                    </el-form-item>
                                </el-tooltip>
                                <el-tooltip class="item" effect="dark" content="此參數影響推桿位置，請務必確認靶寬必須小於版寬" placement="right">
                                    <el-form-item label="版寬(mm):">
                                        <el-input-number v-model="ppr_data.RD05M48" size="large" />
                                    </el-form-item>
                                </el-tooltip>
                                <el-tooltip class="item" effect="dark" content="此參數影響遮板高度" placement="right">
                                    <el-form-item label="板高(mm):">
                                        <el-input-number v-model="ppr_data.RD05M47" size="large" />
                                    </el-form-item>
                                </el-tooltip>
                                <el-tooltip class="item" effect="dark" content="此參數影響電鍍時間" placement="right">
                                    <el-form-item label="電鍍時間(分鐘):">
                                        <el-input-number v-model="ppr_data.PlatingTime" size="large"/>
                                    </el-form-item>
                                </el-tooltip>
                                <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="right">
                                    <el-form-item label="單片電鍍電流(PlatingAmp):">
                                        <el-input-number v-model="ppr_data.PlatingAmp" size="large" />
                                    </el-form-item>
                                </el-tooltip>
                                <el-form-item label="上料片數(不包含Dummy):">
                                    <el-tooltip class="item" effect="dark" content="範圍(1~6)" placement="top">
                                        <el-input-number v-model="ppr_data.PlatingPnl" :min="1" :max="6" size="large" />
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item label="電鍍需求:">
                                    <el-radio-group v-model="ppr_data.mode" @change="mode_change">
                                        <el-radio label="一鍍" border>一鍍(CU I)</el-radio>
                                        <el-radio label="二鍍" border>二鍍(CU II)</el-radio>
                                        <el-radio label="重工-孔銅不足" border>重工-孔銅不足(rework-Hole Copper)</el-radio>
                                        <el-radio label="重工-切片不足" border>重工-面銅不足(rework-Surface Copper)</el-radio>
                                        <el-radio label="測試" border>測試(test)</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                                電鍍電流計算公式:
                                [電鍍電流(PlatingAmp){{ppr_data.PlatingAmp}} * 片數{{ppr_data.PlatingPnl}} ] + 10(Dummy) = {{this.ppr_result[1].P_PlatingAmp}}
                            </el-form>
                        </el-row>
                        <el-divider content-position="left">換算實際套用結果</el-divider> 
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
                        <el-divider content-position="left">飛靶編號及刀數可於上料後於生產履歷再修改</el-divider> 
                        <el-row :gutter="10">
                            <el-card>
                                <div slot="header" class="clearfix">
                                    飛靶編號(牆壁 - 走道)
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
                        <el-row :gutter="10">
                            <el-card>
                                <div slot="header" class="clearfix">
                                    刀數(牆壁 - 走道)
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
                    <div v-else-if="prod_step == 3">
                        <el-row >
                            <el-col :span="7" :offset="9">
                                <h3>
                                    預備投料到VCP-004
                                </h3>
                            </el-col>
                        </el-row>
                        <el-row>
                            <center><div class="err" v-show="err_msg">錯誤訊息[{{err_msg}}]</div></center>
                        </el-row>
                        <el-row>
                            <el-col :span="4" :offset="10">
                                <el-button @click="prod_work" type="primary" icon="el-icon-edit">參數寫入PLC</el-button>
                            </el-col>
                        </el-row><el-row /><el-row />
                        <el-row>
                            <el-col :span="4" :offset="10">
                                <el-button @click="prod_confrim" type="primary" icon="el-icon-switch-button">啟動自動模式</el-button>
                            </el-col>
                            <!-- <el-col :span="8" :offset="2">
                                <FeedModeSwitch />                          
                            </el-col> -->
                        </el-row><el-row /><el-row />
                        <el-row>
                            <el-col :span="4" :offset="10">
                                <el-button type="warning" @click="storeDialogFormVisible = true" icon="el-icon-upload2">儲存參數</el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <div v-else-if="prod_step == 4">
                        <el-row />
                            <center><h3>操作完成，按下一步跳轉到首頁查看參數!</h3></center>
                        <el-row />
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
            <el-dialog title="儲存參數" :visible.sync="storeDialogFormVisible">
                <el-form>
                    <el-tooltip class="item" effect="dark" content="名稱不可重複" placement="left">
                        <el-form-item label="幫參數取個名字吧:">
                        <el-input v-model="recipe_name"></el-input>
                        </el-form-item>
                    </el-tooltip>
                    <el-button type="primary" @click="generateRandom">採用預設(料號+批號+製程序)</el-button>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button type="danger" @click="storeDialogFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="RecipeStore">儲存</el-button>
                </div>
            </el-dialog>
        </el-main>
    </el-container>
</template>

<script>
import X2JS from 'x2js'
import FeedModeSwitch from "@/views/VCP20/components/FeedModeSwitch.vue";

export default {
    components: {
        FeedModeSwitch
    },
    data: function()
    {
        return {
            feeding: "人工投料 - 自動模式",
            predict_result: "",
            store_recipe: [],
            source: "runcard",
            recipe_name: "",
            storeDialogFormVisible: false,
            dialogVisible: false,
            ProdCheckList: [ {"key": "EDGE", "status": false, "label": "檢查Edge連線"}, {"key": "RFID", "status": false, "label": "檢查RFID連線"},
                {"key": "PLC", "status": false, "label": "檢查PLC連線"}, {"key": "MES","status": false, "label": "檢查MES連線"} ,{"key": "MES","status": false, "label": "檢查PPR設備連線"}],  
            LotNO: '',
            Operator: '',
            ProcSeq: '',
            loading: false,
            prod_step: 0,
            noteList: [],
            selectRecipe: "",
            err_msg: "",
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
                RD05M136: "", //板厚
                RD05M134 : "", //成品孔銅
                RD05M146 : "",  //最小孔徑
                RD05M49 : "", // 鍍銅面積
                PlatingPnl : 1, //生產片數
                PlatingAmp : "", //生產片數
                RD05M47 : "",  //長
                dummy_height: "",
                RD05M48 : "",  //寬
                PlatingTime : "", //電鍍時間(DC用)
                PPR_or_DC: "DC",
                mode: "二鍍",
                load_mode: "manual",
                carrier: [],
                cut_tag:[],
            },
        }
    },
    mounted()
    {
        Object.keys(this.$store.state.prod).forEach(key =>
        {
            this.$data[key] = this.$store.state.prod[key]
        })
    },
    beforeDestroy()
    {
        let prod_tmep = {}
        Object.keys(this.$data).forEach(key =>
        {
            prod_tmep[key] = this.$data[key]
            if(key == "ppr_data")
            {
                console.log(this.$data[key])
            }
        })
        this.$store.commit('store_prod_state', prod_tmep)
    },
    watch:
    {
        rfid_msg(value)
        {
            let val = value['rfid_msg']
            if(this.prod_step == 1)
            {
                if(val.length < 8)
                {
                    this.$message({ message: "RFID讀取到工號:"+val, type: "info"})
                    this.Operator = val
                }
                else
                {
                    this.$message({ message: "RFID讀取到工單:"+val, type: "info"})
                    this.LotNO = val
                }
            }
        },
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
        'ppr_data.PlatingTime'(value)
        {
            if(this.ppr_data.mode == '一鍍')
            {
                if(value != 80 || value != 60)
                {
                    
                }
            }
        },
    },
    computed:
    {
        isCallAGV()
        {
            if(this.ppr_data.RD05M136 > 8|| this.ppr_data.RD05M136 <= 0)
            {
                return true
            }
            else
            {
                return false
            }
        },
        is_predictable()
        {
            if(this.ppr_data.mode == '二鍍')
            {
                return false
            }
            else
            {
                return true
            }
        },
        is_pick_up()
        {
            if(this.predict_result)
            {
                if(this.ppr_data.mode == '二鍍')
                {
                    return false
                }
                else
                {
                    return true
                }
            }
            else
            {
                return true
            }
        },
        dummy_height()
        {
            let a  = 25 *  Math.ceil(this.ppr_data.RD05M47 / 25)
            if(a < 400 )
            {
                return 400
            }
            else if(a > 750)
            {
                return 750
            }
            else
            {
                return a
            }
        },
        rfid_msg()
        {
            return this.$store.state.rfid_msg
        },
        getWSmessage()
        {
            return this.$store.state._ws_back
        },
        ppr_result()
        {
            let result = []
            let PlatingTime = 0
            let P_PlatingAmp = 0
            let N_PlatingAmp = 0
            let name = ''
            let times = []
            times = [0, 1, 2]
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
                    name = '主電鍍'
                    PlatingTime = this.ppr_data.PlatingTime
                    P_PlatingAmp = (this.ppr_data.PlatingAmp  * this.ppr_data.PlatingPnl) + 10
                    N_PlatingAmp = 0   
                }
                result[i] = 
                {
                    "name" : name,
                    "PlatingTime" : PlatingTime < 0 ? 0: PlatingTime ,
                    "P_PlatingAmp": Math.round(P_PlatingAmp * 100) / 100 ,
                    "N_PlatingAmp": Math.round(N_PlatingAmp * 100) / 100 ,
                }
            }
            return result
        },
    },
    methods:
    {
        handleCurrentChange(val)
        {
            this.selectRecipe = val
        },
        async getStoreRecipe()
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-004/_api/simple/all-keys",
                method: "PUT",
                payload: {collection: "Warehouse"},
            })
            this.store_recipe = []
            response["result"].forEach((element) =>
            {
                this.store_recipe.push({ name: element.split("/")[6] })
            })
            this.loading = false
        },
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
          this.cleanData()
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
            this.err_msg = ""
        },
        async prod_predict()
        {
            this.loading = true
            await fetch('http://10.11.30.62:9999/api/predict/' + this.lotdata["no"], {method: 'GET' })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(!response["response"])
                {
                    throw response["errorMessage"]
                }
                this.$message({ message: "預測成功", type: "success"})
                this.predict_result = Math.round(+response["response"])
            })
            .catch( err =>
            {
                this.$alert(err, '警告(warning)',
                {
                    confirmButtonText: '我知道了',
                    type: 'warning',
                    center: true,
                })
                .then(() => {

                    })
                return false
            })
            .finally( () =>
            {
                this.loading = false
            })
            return true
        },
        pick_up()
        {
            this.ppr_data["PlatingTime"] = this.predict_result
            this.ppr_data["pick_predict"] = true
            this.$message({ message: "套用預測電鍍時間", type: "success"})
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
                if(! Object.keys(res).includes("mfdata"))
                {
                    throw "參數返回格式不符合預期"
                }
                if(res["mfdata"]["exception"])
                {
                    throw res["mfdata"]["exception"]
                }
                if(! res["mfdata"]["procdata"]["procname"].includes("鍍銅"))
                {
                    throw "參數非鍍銅站參數"
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
            fetch('http://10.11.30.62:9999/api/prod/check', {method: 'GET' })
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
        async prod_confrim()
        {
            this.loading = true
            await fetch("http://10.11.30.62:9999/api/mode",
            {   method: 'PUT',
                body: JSON.stringify({
                    mode: "自動模式",
                })
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                if(response["response"])
                {
                    this.$message({ message: "啟動自動模式成功", type: "success"})
                }
                this.err_msg = ""
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge異常回報', message: err})
                this.err_msg = err
            })
            .finally( () =>
            {
                this.loading = false
            })
        },
        async prod_next()
        {
            this.loading = true
            if(this.prod_step == 0)
            {
                if(this.source == "warehouse")
                {
                    await this.getStoreRecipe()
                    this.selectRecipe = ""
                }
            }
            else if(this.prod_step == 1)
            {
                if(this.source == "warehouse")
                {
                    // console.log(this.selectRecipe)
                    if(this.selectRecipe == "")
                    {
                        this.$notify.warning({ message: "請先選擇套用參數!"})
                        this.prod_step = this.prod_step - 1
                    }
                    else
                    {
                        this.loading = true
                        let response = await this.$store.dispatch("_db", { 
                            url: "_db/VCP-004/_api/document/Warehouse/" + this.selectRecipe["name"],
                            method: "GET",
                            payload: {},
                        })
                        this.ppr_data = response["ppr_data"]
                        this.lotdata = response["lotdata"]
                        this.loading = false
                    }
                }
                else if(this.source == "runcard")
                {
                    if(this.LotNO == "" || this.Operator == "")
                    {
                        this.$notify.warning({ message: "批號或工號不能為空!"})
                        this.prod_step = this.prod_step - 1
                    }
                    else
                    {
                        this.ppr_data["RD05M136"] = 0 
                        this.ppr_data["RD05M134"] = 0 
                        this.ppr_data["RD05M146"] = 0 
                        this.ppr_data["RD05M49"] = 0 
                        this.ppr_data["PlatingAmp"] = 0 
                        this.ppr_data["RD05M48"] = 0 
                        this.ppr_data["RD05M47"] = 0 
                        this.ppr_data["PlatingTime"] = 0 
                        this.ppr_data["TotalPnl"] = 0 
                        this.ppr_data["PlatingPnl"] = 1 
                        if(await this.getRecipe())
                        {
                            for(let item of this.procdata.procprams.procpram)
                            {
                                if(item.procprammes in this.ppr_data)
                                {
                                    this.ppr_data[item.procprammes] = +item.procvalue
                                }
                            }
                            //取得板厚
                            this.ppr_data["PlatingPnl"] = this.ppr_data["TotalPnl"]
                            await this.getRD05M136(this.lotdata)
                            this.predict_result = 0
                            if(await this.prod_predict())
                            {
                                this.pick_up()
                            }
                        }
                        else
                        {
                            this.$alert('MES回應異常，請多注意參數', '警告(warning)',
                            {
                                confirmButtonText: '我知道了',
                                type: 'warning',
                                center: true,
                            })
                            .then(() => {

                            })
                        }
                    }
                }
            }
            else if(this.prod_step == 2)
            {
                //
            }
            this.prod_step = this.prod_step + 1
            if(this.prod_step == 5)
            {
                this.prod_step = 0
                this.err_msg = ""
            }
            this.loading = false
        },
        async RecipeStore()
        {
            this.ppr_data["dummy_height"] = this.dummy_height
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-004/_api/document/Warehouse",
                method: "POST",
                payload:
                {
                    _key: this.recipe_name,
                    ppr_data: this.ppr_data,
                    lotdata: this.lotdata,
                    ppr_result: this.ppr_result, 
                },
            })
            if(response)
            {
                this.$message({ message: "儲存成功", type: "success"})
            }
            else
            {
                this.$message({ message: "儲存失敗", type: "error"})
            }
            this.storeDialogFormVisible = false
        },
        mode_change(value)
        {
            if(value == "一鍍")
            {
                this.ppr_data["PlatingTime"] = 80
            }
        },
        async prod_work()
        {
            this.loading = true
            // console.log({                    
            //         ppr_result: this.ppr_result, 
            //         ppr_data: this.ppr_data,
            //         lotdata: this.lotdata,
            //         procdata: this.procdata,
            //         noteList: this.noteList})
            this.lotdata["source"] = "runcard"
            this.ppr_data["dummy_height"] = this.dummy_height
            this.ppr_data["load_mode"] = "manual"
            await fetch("http://10.11.30.62:9999/api/PLC/temp",
            {   method: 'POST',
                body: JSON.stringify({
                    ppr_result: this.ppr_result, 
                    ppr_data: this.ppr_data,
                    lotdata: this.lotdata,
                    procdata: this.procdata,
                    Operator: this.Operator,
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
                if(response["response"])
                {
                    this.$notify.success({ title: '套用參數成功', message: "寫入暫存區及上下料區完成"})   
                }
                this.err_msg = ""
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge異常回報', message: err})
                this.err_msg = err
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
        async getRD05M136(lotdata)
        {
            await fetch("http://10.11.30.62:9999/api/getRD05M136", {method: 'POST', body: JSON.stringify(lotdata)})
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                this.ppr_data["RD05M136"] = response["result"]
                return true
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'MES查無板厚資訊', message: err})
            })
            return false
        },
        async callAGV()
        {
            this.loading = true
            this.ppr_data["load_mode"] = "auto"
            await fetch("http://10.11.30.62:9999/api/CallAGV", {
                method: 'POST',
                body: JSON.stringify({
                    ppr_result: this.ppr_result, 
                    ppr_data: this.ppr_data,
                    lotdata: this.lotdata,
                    procdata: this.procdata,
                    noteList: this.noteList,
                })})
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                if(response["response"])
                {
                    this.$notify.success({ title: '呼叫AGV成功', message: "寫入暫存區完成"})   
                }
                this.err_msg = ""
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge異常回報', message: err})
                this.err_msg = err
            })
            .finally( () =>
            {
                this.loading = false
            })
        },
        async CheckData()
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-004/_api/simple/all-keys",
                method: "PUT",
                payload: {collection: "Warehouse"},
            })
            this.result = response["result"]
            this.loading = false
        },
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
.el-table >>> .el-table__body tr.current-row>td {
  background: #f0ba87!important;
}
.err
{
    color: #f54838;
}
</style>