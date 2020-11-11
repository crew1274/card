<template>
    <el-container>
        <el-header height="60px" >
            <center>生產履歷</center>
            <el-divider />
        </el-header>
        <el-main v-loading="loading" element-loading-text="努力載入中"
            element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
            <el-row :gutter="10">
                <el-col :span="16">
                    <el-date-picker v-model="date_range" type="daterange" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd"
                        start-placeholder="開始日期" range-separator="至" end-placeholder="結束日期" 
                        :picker-options="pickerOptions" @change="CheckData"
                        size="large"/>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" icon="el-icon-download" @click="download">匯出Excel</el-button>
                </el-col>
                <!-- <el-col :span="4">
                    <el-button type="primary" icon="el-icon-download" @click="TimelineExport">匯出Timeline Excel</el-button>
                </el-col> -->
            </el-row>
            <el-divider />
            <span>黃色表示正在電鍍中，請記得輸入飛靶編號及刀數。</span>
            <!-- <el-table :data="show_data.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%"> -->
            <el-table :data="list" max-height="700" style="width: 100%" border :row-class-name="HighLight">
                <el-table-column label="開始時間" prop="STARTDATETIME" />
                <el-table-column label="結束時間" prop="ENDDATETIME" />
                <el-table-column label="料號" prop="lotdata.itemno" />
                <el-table-column label="批號" prop="lotdata.no" />
                <el-table-column label="電鍍需求" prop="ppr_data.mode" />
                <el-table-column label="電鍍模式" prop="ppr_data.PPR_or_DC" />
                <el-table-column label="上料方式" prop="ppr_data.load_mode" />
                <el-table-column >
                <template slot="header">
                    動作
                </template>
                <template slot-scope="scope">
                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-button size="mini" type="primary" @click="handleCheck(scope.row)">查看詳細</el-button>
                        </el-col>
                        <!-- <el-col :span="12">
                            <el-button size="mini" type="primary" @click="handleTimeline(scope.row)">Timeline</el-button>
                        </el-col> -->
                    </el-row>
                </template>
                </el-table-column>
            </el-table>
            <el-dialog title="詳細資訊" :visible.sync="recipeDialogVisible" width="80%">
                <el-row>
                    <el-card header="批號資料" class="content">
                        <el-row>
                            <el-col :span="8">
                                批號: {{lotdata.itemno}}
                            </el-col>
                            <el-col :span="8">
                                料號: {{lotdata.no}}
                            </el-col>
                            <el-col :span="8">
                                製程序: {{lotdata.procseq}}
                            </el-col>
                        </el-row>
                    </el-card>
                </el-row>
                <el-divider />
                <el-row>
                    上料操作同仁: {{Operator}}
                </el-row>
                <el-divider />
                <el-row>    
                    <el-card header="參數資料" class="content">
                        <el-row>
                        <el-col :span="8">
                            板寬: {{ppr_data.RD05M48}}(mm)
                        </el-col>
                        <el-col :span="8">
                            板高: {{ppr_data.RD05M47}}(mm)
                        </el-col>
                        <el-col :span="8">
                            Dummy 板高: {{ppr_data.dummy_height}}(mm)
                        </el-col>
                        </el-row>
                        <el-row>
                        <el-col :span="8">
                            單片電流: {{ppr_data.PlatingAmp}}(A)
                        </el-col>
                        <el-col :span="8">
                            片數: {{ppr_data.PlatingPnl}}
                        </el-col>
                        <el-col :span="8">
                            電鍍時間: {{ppr_data.PlatingTime}}(分鐘)
                        </el-col>
                        </el-row>
                        <el-row>
                        <el-col :span="8">
                            上料方式: {{ppr_data.load_mode}}
                        </el-col>
                        <el-col :span="8">
                            電鍍需求: {{ppr_data.mode}}
                        </el-col>
                        <el-col :span="8">
                            電鍍方式: {{ppr_data.PPR_or_DC}}
                        </el-col>
                        </el-row>
                        <el-row>
                        </el-row>
                    </el-card>
                </el-row>
                <h4>電鍍電流計算公式:
                        [單片電鍍電流(PlatingAmp){{ppr_data.PlatingAmp}} * 片數{{ppr_data.PlatingPnl}} ] + 10(Dummy) =
                        {{(ppr_data.PlatingAmp * ppr_data.PlatingPnl) + 10}}
                </h4>
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
                <el-divider />
                <div v-if="ppr_data.load_mode == 'manual'">
                    <el-row :gutter="10">
                        <el-card>
                            <div slot="header" class="clearfix">
                                使用手動上料的原因(其餘原因則直接輸入):
                                <el-button style="float: right;" type="primary" @click="update_db">更新</el-button>
                            </div>
                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-select class="long" v-model="ppr_data.reason" placeholder="原因選擇/輸入" filterable allow-create>
                                        <el-option v-for="reason in reasons" 
                                            :key="reason.label"
                                            :label="reason.label"
                                            :value="reason.label">
                                        </el-option>
                                    </el-select>
                                </el-col>
                            </el-row>
                        </el-card>
                    </el-row>
                    <el-divider />
                </div>
                <div v-if="ppr_data.carrier">
                    <el-row :gutter="10">
                        <el-card>
                            <div slot="header" class="clearfix">
                                飛靶編號(牆壁 - 走道)
                                <el-button style="float: right;" type="primary" @click="update_db">更新</el-button>
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
                <div v-if="ppr_data.cut_tag">
                    <el-row :gutter="10">
                        <el-card>
                            <div slot="header" class="clearfix">
                                刀數(牆壁 - 走道)
                                <el-button style="float: right;" type="primary" @click="update_db">更新</el-button>
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
                    <!-- <ve-line :data="chartData"></ve-line> -->
            </el-dialog>
            <el-dialog title="生產足跡" :visible.sync="timelineDialogVisible" width="80%" >
                <el-row>
                    <el-card header="批號資料" class="content">
                        <el-row>
                            <el-col :span="8">
                                料號: {{row.lotdata.itemno}}
                            </el-col>
                            <el-col :span="8">
                                批號: {{row.lotdata.no}}
                            </el-col>
                        </el-row>
                    </el-card>
                </el-row>
                <el-timeline>
                    <el-timeline-item v-for="(point, index) in timeline" :key="index" 
                    size="large" type="primary" :timestamp="point.ppr_data.mode" placement="top">
                        <el-card class="content">
                            <p>設備: {{point.eqt}}</p>
                            <p>生產時間: {{point.STARTDATETIME}} ~ {{point.ENDDATETIME}}</p>
                            <p>片數: {{point.ppr_data.PlatingPnl}}</p>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </el-dialog>
        </el-main>
  </el-container>
</template>

<script>
import * as moment from "moment/moment"
import XLSX from 'xlsx'

export default {
    data: function()
    {
        return {
                reasons: [{
                    label: '板尺寸超過極限(The board size exceeds the limit)'
                    }, {
                    label: '上下料機構異常(Abnormal loading and unloading mechanism)'
                    }, {
                    label: 'AGV異常，無法上料(AGV is abnormal and cannot be loaded)'
                    }, {
                    label: '網路連線異常(Internet connection is abnormal)'
                    }, {
                    label: '板厚超出機台極限(The plate thickness exceeds the limit of the machine)'
                    }, {
                    label: '測試用(For test)'
                    }],
            loading: false,
            date_range: [],
            search: "",
            token: "",
            list : [],
            noteList: [],
            Operator: "",
            deleteDialogVisible: false,
            recipeDialogVisible: false,
            timelineDialogVisible: false,
            timeline: [],
            delete_name: "",
            ppr_data: "",
            lotdata: "",
            ppr_result: [],
            chartData: {
                columns: [],
                rows: []
            },
            result: "",
            row: {
                lotdata : {
                    no: "",
                    itemno: "",
                }
            },
            pickerOptions:
            {
                shortcuts: [ {
                text: '昨天',
                onClick(picker) {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24)
                    picker.$emit('pick', [start, end]) }
                }, {
                text: '一周前',
                onClick(picker) {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                    picker.$emit('pick', [start, end]) }
                }, {
                text: '二周前',
                onClick(picker) {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 14)
                    picker.$emit('pick', [start, end]) }
                }, {
                text: '三周前',
                onClick(picker) {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 21)
                    picker.$emit('pick', [start, end]) }
                }, {
                text: '四周前',
                onClick(picker) {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 28)
                    picker.$emit('pick', [start, end]) }
                }]
            },
        }
    },
    computed:
    {
        source()
        {
            return this.lotdata.source == "runcard" ? "製程參數套用": "歷史參數套用"
        },
        show_data()
        {
            let arr = []
            this.list.forEach((element) =>
            {
                arr.push({ name: element.split("/")[6] })
            })
            return arr
        },
    },
    async created()
    {
        moment.locale("zh-tw")
        this.date_range.push(moment().subtract(7,'d').format('YYYY-MM-DD'))
        this.date_range.push(moment().format('YYYY-MM-DD'))
        await this.CheckData()
        // let response = await this.$store.dispatch("_db", { 
        //     url: "_db/VCP-20/_api/cursor",
        //     method: "POST",
        //     payload: {"query": "FOR doc IN History SORT doc.STARTDATETIME DESC LIMIT 1 RETURN doc",
        //     "count": true,
        //     "batchSize": 2},
        // })
        // console.log(response)
    },
    methods: 
    {
        HighLight({row, rowIndex})
        {
            if(! row["ENDDATETIME"] && rowIndex < 1 )
            {
                return 'warning-row'
            }
            else
            {
                return ''
            }
        },
        async TimelineExport()
        {
            this.loading = true
            let data = []
            let timeline = []
            let container = {}
            this.list.forEach( async ele =>
            {
                let response = await this.$store.dispatch("_db", { 
                    url: "_db/VCP-20/_api/cursor",
                    method: "POST",
                    payload: {
                        'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + ele["lotdata"]["no"] + "' RETURN doc"
                    },
                })
                response["result"].forEach( element =>
                {
                    element["eqt"] = "VCP-20"
                    timeline.push(element)
                })

                response = await this.$store.dispatch("_db", { 
                    url: "_db/VCP-30/_api/cursor",
                    method: "POST",
                    payload: {
                        'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + ele["lotdata"]["no"] + "' RETURN doc"
                    },
                })
                response["result"].forEach( (element) =>
                {
                    element["eqt"] = "VCP-30"
                    timeline.push(element)
                })

                response = await this.$store.dispatch("_db", { 
                    url: "_db/VCP-004/_api/cursor",
                    method: "POST",
                    payload: {
                        'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + ele["lotdata"]["no"] + "' RETURN doc"
                    },
                })
                response["result"].forEach( (element) =>
                {
                    element["eqt"] = "VCP-40"
                    timeline.push(element)
                })

                timeline = timeline.sort(function (a, b)
                {
                    return a.STARTDATETIME > b.STARTDATETIME ? 1 : -1;
                })

                //欄位轉換
                timeline.forEach( e => {
                    let item = {}
                    item["批號"] = ele["lotdata"]["itemno"]
                    item["料號"] = ele["lotdata"]["no"]
                    item["開始時間"] = ele["STARTDATETIME"]
                    item["結束時間"] = ele["ENDDATETIME"]
                    
                    item["單片電鍍電流(A)"] = ele["ppr_data"]["PlatingAmp"]
                    item["上料片數(不包含Dummy)"] = ele["ppr_data"]["PlatingPnl"]
                    item["電鍍時間(分鐘)_DC模式下"] = ele["ppr_data"]["PlatingTime"]

                    item["孔銅需求(mil)"] = ele["ppr_data"]["RD05M134"]
                    item["最小孔徑(mil)"] = ele["ppr_data"]["RD05M146"]
                    item["面積(SQIN)"] = ele["ppr_data"]["RD05M49"]
                    item["板高(mm)"] = ele["ppr_data"]["RD05M47"]
                    item["Dummy板高(mm)"] = ele["ppr_data"]["dummy_height"]
                    item["板寬(mm)"] = ele["ppr_data"]["RD05M48"]
                    item["板厚(mm)"] = ele["ppr_data"]["RD05M136"]
                    item["上料模式"] = ele["ppr_data"]["load_mode"]
                    item["電鍍模式"] = ele["ppr_data"]["PPR_or_DC"]
                    item["電鍍需求"] = ele["ppr_data"]["mode"]

                    item["起始電鍍_電鍍時間"] = ele["ppr_result"][0]["PlatingTime"]
                    item["起始電鍍_正向電鍍電流"] = ele["ppr_result"][0]["P_PlatingAmp"]
                    item["起始電鍍_反向電鍍電流"] = ele["ppr_result"][0]["N_PlatingAmp"]

                    item["主電鍍_電鍍時間"] = ele["ppr_result"][1]["PlatingTime"]
                    item["主電鍍_正向電鍍電流"] = ele["ppr_result"][1]["P_PlatingAmp"]
                    item["主電鍍_反向電鍍電流"] = ele["ppr_result"][1]["N_PlatingAmp"]

                    item["結束電鍍_電鍍時間"] = ele["ppr_result"][2]["PlatingTime"]
                    item["結束電鍍_正向電鍍電流"] = ele["ppr_result"][2]["P_PlatingAmp"]
                    item["結束電鍍_反向電鍍電流"] = ele["ppr_result"][2]["N_PlatingAmp"]
                    data.push(item)
                })
                container[ ele["lotdata"]["no"] ] = data
                data = []
                timeline = []
            })
            const wbout = XLSX.utils.book_new()

            // for (let [key, value] of Object.entries(container))
            for(let key in container)
            {
                XLSX.utils.book_append_sheet(wbout, XLSX.utils.json_to_sheet(container[key]), key )
            }
            this.loading = false
            XLSX.writeFile(wbout, '生產足跡.xlsx')
        },
        async download()
        {
            this.loading = true
            // let tres = []

            // let response = await this.$store.dispatch("_db", { 
            //     url: "/_db/VCP-20/_api/cursor",
            //     method: "POST",
            //     payload: {
            //         "query": "FOR doc IN History \
            //          SORT doc.STARTDATETIME DESC RETURN doc"
            //     },
            // })
            // tres = response["result"]
            // console.log(tres)
            let data = []
            this.list.forEach( ele =>
            {
                let item = {}
                item["批號"] = ele["lotdata"]["itemno"]
                item["料號"] = ele["lotdata"]["no"]
                item["操作同仁"] = ele["Operator"]
                item["開始時間"] = ele["STARTDATETIME"]
                item["結束時間"] = ele["ENDDATETIME"]
                
                item["單片電鍍電流(A)"] = ele["ppr_data"]["PlatingAmp"]
                item["上料片數(不包含Dummy)"] = ele["ppr_data"]["PlatingPnl"]
                item["電鍍時間(分鐘)_DC模式下"] = ele["ppr_data"]["PlatingTime"]

                item["孔銅需求(mil)"] = ele["ppr_data"]["RD05M134"]
                item["最小孔徑(mil)"] = ele["ppr_data"]["RD05M146"]
                item["面積(SQIN)"] = ele["ppr_data"]["RD05M49"]
                item["板高(mm)"] = ele["ppr_data"]["RD05M47"]
                item["Dummy板高(mm)"] = ele["ppr_data"]["dummy_height"]
                item["板寬(mm)"] = ele["ppr_data"]["RD05M48"]
                item["板厚(mm)"] = ele["ppr_data"]["RD05M136"]
                item["上料模式"] = ele["ppr_data"]["load_mode"]
                item["手動原因"] = ele["ppr_data"]["reason"]
                item["電鍍模式"] = ele["ppr_data"]["PPR_or_DC"]
                item["電鍍需求"] = ele["ppr_data"]["mode"]

                item["起始電鍍_電鍍時間"] = ele["ppr_result"][0]["PlatingTime"]
                item["起始電鍍_正向電鍍電流"] = ele["ppr_result"][0]["P_PlatingAmp"]
                item["起始電鍍_反向電鍍電流"] = ele["ppr_result"][0]["N_PlatingAmp"]

                item["主電鍍_電鍍時間"] = ele["ppr_result"][1]["PlatingTime"]
                item["主電鍍_正向電鍍電流"] = ele["ppr_result"][1]["P_PlatingAmp"]
                item["主電鍍_反向電鍍電流"] = ele["ppr_result"][1]["N_PlatingAmp"]

                item["結束電鍍_電鍍時間"] = ele["ppr_result"][2]["PlatingTime"]
                item["結束電鍍_正向電鍍電流"] = ele["ppr_result"][2]["P_PlatingAmp"]
                item["結束電鍍_反向電鍍電流"] = ele["ppr_result"][2]["N_PlatingAmp"]
                data.push(item) 
            })
            const wbout = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)
            
            XLSX.utils.book_append_sheet(wbout, ws, "生產履歷")
            this.loading = false
            XLSX.writeFile(wbout, 'VCP-20生產履歷.xlsx')
        },
        async CheckData()
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "/_db/VCP-20/_api/cursor",
                method: "POST",
                payload: {
                    "query": "FOR doc IN History \
                     SORT doc.STARTDATETIME DESC \
                     FILTER doc.`STARTDATETIME` <= '"+ moment(this.date_range[1]).add(1,'d').format('YYYY-MM-DD') +"' \
                     AND  doc.`STARTDATETIME` > '"+ this.date_range[0] +"' RETURN doc"
                },
            })
            // moment(this.date_range[1]).add(1,'d').format('YYYY-MM-DD')
            // this.date_range.push(moment().add(1,'d').format('YYYY-MM-DD'))
            this.list = response["result"]
            this.loading = false
        },
        async update_db()
        {
            this.loading = true
            this.result["ppr_data"] = this.ppr_data
            this.result["Editdatetime"] = moment().format('YYYY-MM-DD HH:mm:ss')
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-20/_api/document/History/" + this.row["_key"],
                method: "PUT",
                payload: this.result,
            })
            if(response)
            {
                this.$message({ message: "更新成功", type: "success"})
            }
            this.loading = false
        },
        async handleTimeline(row)
        {
            let timeline = []
            this.loading = true
            this.row = row
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-20/_api/cursor",
                method: "POST",
                payload: {
                    'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + this.row["lotdata"]["no"] + "' RETURN doc"
                },
            })
            response["result"].forEach( (element) =>
            {
                element["eqt"] = "VCP-20"
                timeline.push(element)
            })
            response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-30/_api/cursor",
                method: "POST",
                payload: {
                    'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + this.row["lotdata"]["no"] + "' RETURN doc"
                },
            })
            response["result"].forEach( (element) =>
            {
                element["eqt"] = "VCP-30"
                timeline.push(element)
            })
            response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-004/_api/cursor",
                method: "POST",
                payload: {
                    'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + this.row["lotdata"]["no"] + "' RETURN doc"
                },
            })
            response["result"].forEach( (element) =>
            {
                element["eqt"] = "VCP-40"
                timeline.push(element)
            })
            
            timeline = timeline.sort(function (a, b)
            {
                return a.STARTDATETIME > b.STARTDATETIME ? 1 : -1;
            })
            this.timeline = timeline
            this.timelineDialogVisible = true
            this.loading = false
        },
        async handleCheck(row)
        {
            // await this.Qinflux(row["STARTDATETIME"], row["ENDDATETIME"])
            this.loading = true
            this.row = row
            // console.log(this.row["RANDOMSTRING"])
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-20/_api/document/History/" + this.row["_key"],
                method: "GET",
                payload: {},
            })
            // console.log(response)
            if(response)
            {
                this.result = response
                this.ppr_data = response["ppr_data"]
                this.lotdata = response["lotdata"]
                this.ppr_result = response["ppr_result"]
                this.noteList = response["noteList"]
                this.Operator = response["Operator"]
                this.recipeDialogVisible = true
            }
            this.loading = false
        },
        async Qinflux(start, end)
        {
            this.loading = true
            let start_time = moment(start, 'YYYY-MM-DD HH:mm:ss').toISOString()
            // let start_time = "2019-11-10 13:06:35"

            let end_time = moment(end, 'YYYY-MM-DD HH:mm:ss').add(10, 'minutes').toISOString()
            // let end_time = "2019-11-11 14:52:27"

            await fetch("http://10.11.0.156:8086/query?db=VCP_20&q=SELECT average_current_1, average_current_2, average_voltage_1, average_voltage_2 FROM PPR WHERE time > '"+ start_time + "' AND time < '" + end_time + "' ",
            {
                method: "GET",
                headers : { 'Content-Type' : 'application/x-www-form-urlencoded' },
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                // this.chartData["rows"] = []
                let values = response["results"][0]["series"][0]["values"] /* 2-D array */
                let columns = response["results"][0]["series"][0]["columns"] /* 1-D array */
                this.chartData["columns"] = columns
                this.chartData["rows"] = []
                for(let i = 0; i< values.length; i+=50)
                {
                    this.chartData["rows"].push(
                    {
                        "time" : moment(values[i][0]).format('YYYY-MM-DD HH:mm:ss'),
                        "average_current_1" : values[i][1] /10,
                        "average_current_2" : values[i][2] /10,
                        "average_voltage_1" : values[i][3] /10,
                        "average_voltage_2" : values[i][4] /10,
                    })
                }
                // this.chartData["columns"] = response["results"][0]["series"][0]["columns"] /* 1-D array */
                // for(let i = 0; i<values.length; i+=600)
                // {
                //     let ob = {}
                //     // console.log(this.chartData["columns"])
                //     for(let k = 0; k<this.chartData["columns"].length; i++)
                //     {
                        
                //     }
                //     // (this.chartData["columns"]).ForEach( (element, index, arr) =>
                //     // {
                //     //     ob[element] = values[i][index]
                //     // })
                //     this.chartData["rows"].push(ob)
                // }
                // this.chartOptions["xaxis"]["categories"] = []
                // this.series[0]["data"] = []
                // this.series[1]["data"] = []
                // this.series[2]["data"] = []
                // this.series[3]["data"] = []
                // for(let i = 0; i<values.length; i+=30)
                // {
                //     let element = values[i]
                //     this.chartOptions["xaxis"]["categories"].push(moment(element[0]).format('YYYY-MM-DD HH:mm:ss'))
                //     this.series[0]["data"].push(element[1] /10)
                //     this.series[1]["data"].push(element[2] /10)
                //     this.series[2]["data"].push(element[3] /10)
                //     this.series[3]["data"].push(element[4] /10)
                // }
                // this.VueApexCharts.exec()
                // console.log(this.apexchart)
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'inFlux資料庫存取異常', message: err})
            })
            .finally( () => {
                this.loading = false
            })
        },
    }
}
</script>

<style scoped>
.el-table >>> .warning-row
{
    background: #f2a202
}
.el-card
{
  margin-bottom: 15px;
}
.content
{
    font-size: 24px;
}
.long
{
    width: 100%;
}
</style>