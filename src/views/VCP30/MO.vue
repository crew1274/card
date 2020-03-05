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
                    :picker-options="pickerOptions" 
                    size="large"/>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" icon="el-icon-download" @click="download">匯出excel</el-button>
                </el-col>
            </el-row>
            <el-divider />
            <span>黃色表示正在電鍍中，請記得輸入飛靶編號及刀數。</span>
            <!-- <el-table :data="show_data.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%"> -->
            <el-table :data="list" max-height="700" style="width: 100%" border :row-class-name="HighLight">
                <el-table-column label="開始時間" prop="STARTDATETIME" />
                <el-table-column label="結束時間" prop="ENDDATETIME" />
                <el-table-column label="料號" prop="PARTNO" />
                <el-table-column label="批號" prop="LOTNO" />
                <el-table-column label="來源" prop="SOURCE" />
                <el-table-column label="電鍍模式" prop="PPR_or_DC" />
                <el-table-column >
                <template slot="header">
                    動作
                </template>
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" @click="handleCheck(scope.row)">查看詳細</el-button>
                </template>
                </el-table-column>
            </el-table>
            <el-dialog title="參數詳細資訊" :visible.sync="recipeDialogVisible" width="80%">
                <el-row>
                    <el-col :span="6">
                        <h3>料號:{{lotdata.itemno}}</h3>
                    </el-col>                    
                    <el-col :span="6">
                        <h3>批號:{{lotdata.no}}</h3>
                    </el-col>
                    <el-col :span="6">
                        <h3>製程序:{{lotdata.procseq}}</h3>
                    </el-col>
                    <el-col :span="6">
                        <h3>參數來源:{{source}}</h3>
                    </el-col>
                </el-row>
                <el-divider />
                <el-row>    
                    <h3>   
                    <center>電鍍模式:{{ppr_data.PPR_or_DC}}</center>
                    <div v-for="(note, index) in noteList" :key="index">
                        <el-tag type="danger">{{note}}</el-tag>
                    </div>
                    </h3>
                </el-row>
                <div v-if="ppr_data.PPR_or_DC == 'PPR'">
                    <el-row>
                        <el-form ref="form" :model="ppr_data" size="medium">
                            <el-row>
                                <el-col :span="12">
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                        <h3>孔銅需求(mil):{{ppr_data.RD05M134}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                        <h3>最小孔徑(mil):{{ppr_data.RD05M146}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                        <h3>當站板厚(mm):{{ppr_data.RD05M136}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="left">
                                        <h3>面積(SQIN):{{ppr_data.RD05M49}}</h3>     
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響遮板高度及電鍍電流" placement="left">
                                        <h3>板長(mm):{{ppr_data.RD05M47}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響推桿位置" placement="left">
                                        <h3>板寬(mm):{{ppr_data.RD05M48}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="範圍(1~6)" placement="left">
                                        <h3>上料片數(不包含Dummy):{{ppr_data.PlatingPnl}}</h3>
                                    </el-tooltip>
                                </el-col>
                                <el-col :span="12">
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍第一段電鍍時間" placement="left">
                                        <h3>電鍍第一段補償時間:{{ppr_data.PlatingTime_1_offset}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍第二段電鍍時間" placement="left">
                                        <h3>電鍍第二段補償時間:{{ppr_data.PlatingTime_2_offset}}</h3>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="此參數影響電鍍第三段電鍍時間" placement="left">
                                        <h3>電鍍第三段補償時間:{{ppr_data.PlatingTime_3_offset}}</h3>  
                                    </el-tooltip>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-row>
                </div>
                <div v-else-if="ppr_data.PPR_or_DC == 'DC'">
                    <el-form ref="form" :model="ppr_data" size="medium">
                        <el-tooltip class="item" effect="dark" content="此參數影響推桿位置" placement="left">
                            <h3>板寬(mm):{{ppr_data.RD05M48}}</h3>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="此參數影響遮板高度" placement="left">
                            <h3>板長(mm):{{ppr_data.RD05M47}}</h3>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍時間" placement="left">
                            <h3>電鍍時間(分鐘):{{ppr_data.PlatingTime}}</h3>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="範圍(1~6)" placement="top">
                            <h3>上料片數(不包含Dummy):{{ppr_data.PlatingPnl}}</h3>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="此參數影響電鍍電流" placement="leftyarbn ">
                            <h3>電鍍面積(SQIN):{{ppr_data.RD05M49}}</h3>
                        </el-tooltip> 
                    </el-form>
                </div>
                <div v-if="ppr_data.carrier">
                    <el-row :gutter="10">
                        <el-card>
                            <div slot="header" class="clearfix">
                                飛靶編號(面對設備 從裡面到外面)
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
                                刀數(面對設備 從裡面到外面)
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
                <el-row>
                    <el-col :span="24">
                        <el-table :data="ppr_result_convert" style="font-size: 20px; width: 100%">
                            <el-table-column prop="name" label="" width="180" />
                            <el-table-column prop="current_time" label="電鍍時間 (min)" width="180" />
                            <el-table-column prop="forward_current" label="正向電流 (A)" width="180" />
                            <el-table-column prop="reverse_current" label="負向電流 (A)" width="180" />
                        </el-table>  
                    </el-col>
                </el-row>
                <el-divider />
                    <ve-line :data="chartData"></ve-line>
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
            loading: false,
            date_range: [],
            search: "",
            token: "",
            list : [],
            noteList: [],
            deleteDialogVisible: false,
            recipeDialogVisible: false,
            delete_name: "",
            ppr_data: "",
            lotdata: "",
            ppr_result: [],
            chartData: {
                columns: [],
                rows: []
            },
            result: "",
            row: undefined,
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
        source: function()
        {
            return this.lotdata.source == "runcard" ? "製程參數套用": "歷史參數套用"
        },
        show_data:function ()
        {
            let arr = []
            this.list.forEach((element) =>
            {
                arr.push({ name: element.split("/")[6] })
            })
            return arr
        },
        ppr_result_convert: function()
        {
            let ppr_result_convert = []
            if(this.ppr_data.PPR_or_DC == 'DC')
            {
                
                ppr_result_convert.push(this.ppr_result[0])
                ppr_result_convert.push(this.ppr_result[1])
                ppr_result_convert.push(this.ppr_result[4])
            }
            else
            {
                ppr_result_convert = this.ppr_result
            }
            return ppr_result_convert
        }
    },
    async created()
    {
        moment.locale("zh-tw")
        this.date_range.push(moment().subtract(7,'d').format('YYYY-MM-DD'))
        this.date_range.push(moment().add(1,'d').format('YYYY-MM-DD'))
        await this.CheckData()
    },
    methods: 
    {
        HighLight({row, rowIndex})
        {
            if(row["STARTDATETIME"] == row["ENDDATETIME"] && rowIndex < 1 )
            {
                return 'warning-row'
            }
            else
            {
                return ''
            }
        },
        async download()
        {
            this.loading = true
            let tres = []
            await fetch("http://10.11.30.61:9999/api/mo_all",
            {
                method: "GET",
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                tres = response["result"]
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge資料庫存取異常', message: err})
            })
            .finally( () =>
            {
                this.loading = false
            })
            this.loading = true
            let data = []
            tres.forEach( ele =>
            {
                let item = {}
                item["批號"] = ele["LOTNO"]
                item["料號"] = ele["PARTNO"]
                item["開始時間"] = ele["STARTDATETIME"]
                item["結束時間"] = ele["ENDDATETIME"]
                item["孔銅需求(mil)"] = ele["detail"]["ppr_data"]["RD05M134"]
                item["最小孔徑(mil)"] = ele["detail"]["ppr_data"]["RD05M146"]
                item["當站板厚(mm)"] = ele["detail"]["ppr_data"]["RD05M136"]
                item["面積(SQIN)"] = ele["detail"]["ppr_data"]["RD05M49"]
                item["板長(mm)"] = ele["detail"]["ppr_data"]["RD05M47"]
                item["板寬(mm)"] = ele["detail"]["ppr_data"]["RD05M48"]
                item["上料片數(不包含Dummy)"] = ele["detail"]["ppr_data"]["PlatingPnl"]
                item["電鍍第一段補償時間"] = ele["detail"]["ppr_data"]["PlatingTime_1_offset"]
                item["電鍍第二段補償時間"] = ele["detail"]["ppr_data"]["PlatingTime_2_offset"]
                item["電鍍第三段補償時間"] = ele["detail"]["ppr_data"]["PlatingTime_3_offset"]

                item["電鍍第一段補償時間"] = ele["detail"]["ppr_data"]["PlatingTime_1_offset"]
                item["電鍍第二段補償時間"] = ele["detail"]["ppr_data"]["PlatingTime_2_offset"]
                item["電鍍第三段補償時間"] = ele["detail"]["ppr_data"]["PlatingTime_3_offset"]

                item["電鍍時間(分鐘)_DC模式下"] = ele["detail"]["ppr_data"]["PlatingTime"]

                item["起始電鍍_電鍍時間"] = ele["detail"]["ppr_result"][0]["current_time"]
                item["起始電鍍_正向電鍍電流"] = ele["detail"]["ppr_result"][0]["forward_current"]
                item["起始電鍍_正向電鍍時間"] = ele["detail"]["ppr_result"][0]["forward_current_time"]
                item["起始電鍍_反向電鍍電流"] = ele["detail"]["ppr_result"][0]["reverse_current"]
                item["起始電鍍_反向電鍍時間"] = ele["detail"]["ppr_result"][0]["reverse_current_time"]
                for(let i=1; i<4; i++)
                {
                    item["第"+(i).toString()+"段電鍍_電鍍時間"] = ele["detail"]["ppr_result"][i]["current_time"]
                    item["第"+(i).toString()+"段電鍍_正向電鍍電流"] = ele["detail"]["ppr_result"][i]["forward_current"]
                    item["第"+(i).toString()+"段電鍍_正向電鍍時間"] = ele["detail"]["ppr_result"][i]["forward_current_time"]
                    item["第"+(i).toString()+"段電鍍_反向電鍍電流"] = ele["detail"]["ppr_result"][i]["reverse_current"]
                    item["第"+(i).toString()+"段電鍍_反向電鍍時間"] = ele["detail"]["ppr_result"][i]["reverse_current_time"]
                }
                item["結束電鍍_電鍍時間"] = ele["detail"]["ppr_result"][4]["current_time"]
                item["結束電鍍_正向電鍍電流"] = ele["detail"]["ppr_result"][4]["forward_current"]
                item["結束電鍍_正向電鍍時間"] = ele["detail"]["ppr_result"][4]["forward_current_time"]
                item["結束電鍍_反向電鍍電流"] = ele["detail"]["ppr_result"][4]["reverse_current"]
                item["結束電鍍_反向電鍍時間"] = ele["detail"]["ppr_result"][4]["reverse_current_time"]
                data.push(item) 
            })
            const ws = XLSX.utils.json_to_sheet(data)
            const wbout = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wbout, ws, "生產履歷")
            this.loading = false
            XLSX.writeFile(wbout, 'VCP-30生產履歷.xlsx')
        },
        async CheckData()
        {
            this.loading = true
            await fetch("http://10.11.30.61:9999/api/mo",
            {
                method: "GET",
            })
            .then( response => {return response.json()})
            .then( response =>
            {
                if(response["Exception"])
                {
                    throw response["Exception"]
                }
                this.list = response["result"]
                console.log(response["result"])
            })
            .catch( err =>
            {
                this.$notify.warning({ title: '資料庫存取異常，聯絡#1385', message: err})
            })
            .finally( () => {
                this.loading = false
            })
        },
        async update_db()
        {
            this.loading = true
            this.result["ppr_data"] = this.ppr_data
            this.result["datetime"] = moment().format('YYYY-MM-DD HH:mm:ss')
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-30/_api/document/History/" + this.row["RANDOMSTRING"],
                method: "PUT",
                payload: this.result,
            })
            if(! response )
            {
                this.$message({ message: "更新成功", type: "success"})
            }
            this.loading = false
        },
        async handleCheck(row)
        {
            await this.Qinflux(row["STARTDATETIME"], row["ENDDATETIME"])
            this.loading = true
            this.row = row
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-30/_api/document/History/" + this.row["RANDOMSTRING"],
                method: "GET",
                payload: {},
            })
            if(response)
            {
                this.result = response
                this.ppr_data = response["ppr_data"]
                this.lotdata = response["lotdata"]
                this.ppr_result = response["ppr_result"]
                this.noteList = response["noteList"]
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

            await fetch("http://10.11.0.156:8086/query?db=VCP_30&q=SELECT average_current_1, average_current_2, average_voltage_1, average_voltage_2 FROM PPR WHERE time > '"+ start_time + "' AND time < '" + end_time + "' ",
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

<style>
  .el-table .warning-row
  {
    background: #f2a202
  }
  .clearfix
  {
      font-size: 18px
  }
</style>