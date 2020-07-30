<template>
    <el-container>
        <el-header>
            <el-menu
                :default-active="activeIndex"
                mode="horizontal"
                @select="handleSelect"
                background-color="#545c64"
                text-color="#fff" active-text-color="#ffd04b">
                <el-menu-item index="1">VCP-生產追蹤</el-menu-item>
            </el-menu>
        </el-header>
        <el-main v-loading="loading" element-loading-text="努力載入中"
            element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
            <el-row :gutter="10">
                <el-col :span="8">
                    <el-date-picker v-model="date_range" type="daterange" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd"
                        start-placeholder="開始日期" range-separator="至" end-placeholder="結束日期" 
                        :picker-options="pickerOptions" @change="initData"
                        size="large"/>
                </el-col>
                <el-col :span="6">
                    <el-input placeholder="篩選料號" prefix-icon="el-icon-search" v-model="search_text" />
                </el-col>
                <el-col :span="4" :offset="6">
                    <el-button type="primary" icon="el-icon-download" @click="download">匯出Excel</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-table ref="filterTable"  @cell-click="check"
                :data="data.filter(data => !search_text || data.itemno.toLowerCase().includes(search_text.toLowerCase()))" max-height="700" style="width: 100%" class="hello">
                    <el-table-column label="日期" prop="datetime" width="280"/>
                    <el-table-column label="料號" prop="itemno" width="280"/>
                    <el-table-column label="批號" prop="no" width="280"/>
                    <el-table-column label="一鍍站點" prop="1_platingStation" />
                    <el-table-column label="一鍍片數" prop="1_platingPnl" />
                    <el-table-column label="二鍍站點" prop="2_platingStation" />
                    <el-table-column label="二鍍片數" prop="2_platingPnl" />
                    <el-table-column label="重工站點" prop="re_platingStation" />
                    <el-table-column label="重工片數" prop="re_platingPnl" />
                    <el-table-column>
                        <template slot="header">
                            動作
                        </template>
                        <template slot-scope="scope">
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" @click="handleTimeline(scope.row)">生產足跡</el-button>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <el-dialog title="詳細生產資訊" :visible.sync="ProdDataDialogVisible" width="80%" id="dialog">
                <info :info="info" :device="a" />
            </el-dialog>
            <el-dialog title="生產足跡" :visible.sync="timelineDialogVisible" width="80%" >
                <el-row>
                    <el-card header="批號資料" class="hello">
                        <el-row>
                            <el-col :span="8">
                                料號: {{row.itemno}}
                            </el-col>
                            <el-col :span="8">
                                批號: {{row.no}}
                            </el-col>
                        </el-row>
                    </el-card>
                </el-row>
                <el-timeline>
                    <el-timeline-item v-for="(point, index) in row.r" :key="index" 
                    size="large" type="primary" :timestamp="point.ppr_data.mode" placement="top">
                        <el-card class="hello">
                            <p>設備: {{point.station}}</p>
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
import info from "@/views/Page/Info"

export default {
    components: {
        info,
     },
    data()
    {
      return {
        a: "",
        componentKey: 0,
        activeIndex: '1',
        search_text: "",
        date_range: [],
        data: [],
        row: {},
        info: {},
        loading: false,
        timelineDialogVisible: false,
        ProdDataDialogVisible: false,
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
    async created()
    {
        await this.get_token()
        this.date_range.push(moment().subtract(7,'d').format('YYYY-MM-DD'))
        this.date_range.push(moment().format('YYYY-MM-DD'))
    },
    async mounted()
    {
        await this.get_token()
        await this.initData()
    },
    beforeDestroy()
    {
        clearInterval(this.token_timer)
    },
    watch:
    {
        '$store.state.errorMessage':
        {
            handler(newValue)
            {
                this.$notify.warning({ title: newValue.title, message: newValue.message})
            },
            deep: true
        },
    },
    methods:
    {
        check(row, column)
        {
            this.info = {}
            this.a = row[column.property]
            if(row[column.property])
            {
                let mode = ""
                if(column.property == "1_platingStation")
                {
                    mode = "一鍍"
                    this.ProdDataDialogVisible = true
                    this.info = this._.find(row['r'], { 'ppr_data': {"mode": mode}})
                }
                else if(column.property == "2_platingStation")
                {
                    mode = "二鍍"
                    this.ProdDataDialogVisible = true
                    this.info = this._.find(row['r'], { 'ppr_data': {"mode": mode}})
                }
                else if(column.property == "re_platingStation")
                {
                    mode = "重工"
                    this.ProdDataDialogVisible = true
                    this.info = this._.find(row['r'], { 'ppr_data': {"mode": mode}})
                }
            }
            
        },
        download()
        {
            this.loading = true
            const wbout = XLSX.utils.book_new()
            let output = []
            this._.forEach(this.data, element =>
            {
                let r = {}
                r["批號"] = element["itemno"]
                r["料號"] = element["no"]
                r["一鍍站點"] = element["1_platingStation"]
                r["一鍍片數"] = element["1_platingPnl"]
                r["一鍍時間"] = element["1_datetime"]
                r["二鍍站點"] = element["2_platingStation"]
                r["二鍍片數"] = element["2_platingPnl"]
                r["二鍍時間"] = element["2_datetime"]
                r["重工站點"] = element["re_platingStation"]
                r["重工片數"] = element["re_platingPnl"]
                r["重工時間"] = element["re_datetime"]
                output.push(r)
            })
            const ws = XLSX.utils.json_to_sheet(output)
            
            XLSX.utils.book_append_sheet(wbout, ws, "生產足跡")
            this.loading = false
            XLSX.writeFile(wbout, '生產足跡.xlsx')
        },
        handleSelect()
        {

        },
        async get_token()
        {
            let response = await this.$store.dispatch("_db", { 
                url: "_open/auth",
                method: "POST",
                payload: { username: "171104", password: "171104"},
            })
            this.$store.commit('update_token', 'Bearer ' + response["jwt"])
        },
        async handleTimeline(row)
        {
            this.row = row
            this.timelineDialogVisible = true
        },
        async captureDetail(lot_index)
        {
            this.data = []
            lot_index.forEach( async element =>
            {
                let r = []
                let response = await this.$store.dispatch("_db", { 
                    url: "_db/VCP-20/_api/cursor",
                    method: "POST",
                    payload: {
                        'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + element + "' RETURN doc"
                    },
                })
                this._.forEach(response["result"], value => {
                    value["station"] = "VCP-20"
                })
                r = r.concat(response["result"])
                response = await this.$store.dispatch("_db", { 
                    url: "_db/VCP-30/_api/cursor",
                    method: "POST",
                    payload: {
                        'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + element + "' RETURN doc"
                    },
                })
                this._.forEach(response["result"], value => {
                    value["station"] = "VCP-30"
                })
                r = r.concat(response["result"])
                response = await this.$store.dispatch("_db", { 
                    url: "_db/VCP-004/_api/cursor",
                    method: "POST",
                    payload: {
                        'query': "FOR doc IN History FILTER doc.`lotdata`.`no` == '" + element + "' RETURN doc"
                    },
                })
                this._.forEach(response["result"], value => {
                    value["station"] = "VCP-40"
                })
                r = r.concat(response["result"])
                r = r.sort(function (a, b)
                {
                    return a.STARTDATETIME > b.STARTDATETIME ? 1 : -1;
                })
                let top = {
                    'datetime': r[0]["STARTDATETIME"],
                    'no': r[0]["lotdata"]["no"],
                    'itemno': r[0]["lotdata"]["itemno"],
                    'r': r,
                }
                if(this._.find(r, { 'ppr_data': {"mode": "一鍍"}}))
                {
                    top["1_platingStation"] = this._.find(r , { 'ppr_data': {"mode": "一鍍"}})["station"]
                    top["1_platingPnl"] = this._.find(r, { 'ppr_data': {"mode": "一鍍"}})["ppr_data"]["PlatingPnl"]
                    top["1_datetime"] = this._.find(r, { 'ppr_data': {"mode": "一鍍"}})["STARTDATETIME"]
                }
                else
                {
                    top["1_platingStation"] = ""
                    top["1_platingPnl"] = ""
                    top["1_datetime"] = ""
                }
                if(this._.find(r, { 'ppr_data': {"mode": "二鍍"}}))
                {
                    top["2_platingStation"] = this._.find(r, { 'ppr_data': {"mode": "二鍍"}})["station"]
                    top["2_platingPnl"] = this._.find(r, { 'ppr_data': {"mode": "二鍍"}})["ppr_data"]["PlatingPnl"]
                    top["2_datetime"] = this._.find(r, { 'ppr_data': {"mode": "二鍍"}})["STARTDATETIME"]
                }
                else
                {
                    top["2_platingStation"] = ""
                    top["2_platingPnl"] = ""
                    top["2_datetime"] = ""
                }
                if(this._.find(r, { 'ppr_data': {"mode": "重工"}}))
                {
                    top["re_platingStation"] = this._.find(r, { 'ppr_data': {"mode": "重工"}})["station"]
                    top["re_platingPnl"] = this._.find(r, { 'ppr_data': {"mode": "重工"}})["ppr_data"]["PlatingPnl"]
                    top["re_datetime"] = this._.find(r, { 'ppr_data': {"mode": "重工"}})["STARTDATETIME"]
                }
                else
                {
                    top["re_platingStation"] = ""
                    top["re_platingPnl"] = ""
                    top["re_datetime"] = "" 
                }
                this.data.push(top)
            })
        },
        async initData()
        {
            this.loading = true
            let list = []
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
            list = list.concat(response["result"])
            response = await this.$store.dispatch("_db", { 
                url: "/_db/VCP-30/_api/cursor",
                method: "POST",
                payload: {
                    "query": "FOR doc IN History \
                     SORT doc.STARTDATETIME DESC \
                     FILTER doc.`STARTDATETIME` <= '"+ moment(this.date_range[1]).add(1,'d').format('YYYY-MM-DD') +"' \
                     AND  doc.`STARTDATETIME` > '"+ this.date_range[0] +"' RETURN doc"
                },
            })
            list = list.concat(response["result"])
            response = await this.$store.dispatch("_db", { 
                url: "/_db/VCP-004/_api/cursor",
                method: "POST",
                payload: {
                    "query": "FOR doc IN History \
                     SORT doc.STARTDATETIME DESC \
                     FILTER doc.`STARTDATETIME` <= '"+ moment(this.date_range[1]).add(1,'d').format('YYYY-MM-DD') +"' \
                     AND  doc.`STARTDATETIME` > '"+ this.date_range[0] +"' RETURN doc"
                },
            })
            list = list.concat(response["result"])
            let lot_index = []
            list.forEach( element =>
            {
                if( ! lot_index.includes(element.lotdata.no))
                {
                    lot_index.push(element.lotdata.no)
                }
            })
            await this.captureDetail(lot_index)
            this.loading = false
        },
    }
  }
</script>

<style>
.hello {
  font-size: 24px;
}
</style>