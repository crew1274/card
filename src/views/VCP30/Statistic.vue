<template>
    <el-container>
        <el-header height="60px" >
            <center>資料統計</center>
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
            </el-row>
            <el-divider />
            <el-row>
                <el-card header="自動上下料使用率">
                    <el-row>
                        <el-col :span="18">
                            <ve-histogram :data="lineChartData" :settings="chartSettings"></ve-histogram>
                        </el-col>
                        <el-col :span="6">
                            <ve-ring :data="ringChartData"></ve-ring>
                        </el-col>                        
                    </el-row>
                </el-card>
            </el-row>
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
            chartSettings: {
                stack: { '上料方式': ['手動', '自動'] }
            },
            loading: false,
            date_range: [],
            date_range_each_date: [],
            list: [],
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
        ringChartData()
        {
            let row = [
                { "上料模式": "auto", "使用次數": 0},
                { "上料模式": "manual", "使用次數": 0}
            ]
            this.list.forEach( (element) =>
            {
                for(let i=0; i<row.length; i++)
                {
                    if(element["ppr_data"]["load_mode"] == row[i]["上料模式"])
                    {
                        row[i]["使用次數"] = row[i]["使用次數"] + 1
                        break
                    }
                }
            })
            return {
                columns: ['上料模式', '使用次數'],
                rows: row
            }
        },
        lineChartData()
        {
            let data = []
            this.date_range_each_date.forEach( date =>
            {
                let total = 0
                let auto = 0
                let manual = 0
                this.list.forEach( element =>
                {
                    if(moment(element["STARTDATETIME"]) < moment(date) &&
                     moment(element["STARTDATETIME"]) >=  moment(date).subtract(1,'d'))
                    {
                        total = total + 1
                        if(element["ppr_data"]["load_mode"] == "auto") //使用自動模式
                        {
                            auto = auto + 1
                        }
                        else if(element["ppr_data"]["load_mode"] == "manual")
                        {
                            manual = manual + 1
                        }
                        // console.log(element["STARTDATETIME"] + ":" + element["ppr_data"]["load_mode"] )
                    }
                })
                data.push({'日期': date, "手動": manual, "自動": auto})
                // console.log(moment(date).format('YYYY-MM-DD hh:mm:ss') + "-------" + moment(date).subtract(1,'d').format('YYYY-MM-DD hh:mm:ss'))
            })
            return { columns: ['日期', '自動', '手動'], rows: data}
        },
    },
    watch:
    {
        date_range(value)
        {
            this.date_range_each_date = []
            let start = moment(value[0] )
            let end = moment(value[1]).add(1,'d').format('YYYY-MM-DD')
            while (start.isBefore(end))
            {
                this.date_range_each_date.push(start.format('YYYY-MM-DD 08:00:00'))
                start = start.add(1, 'd')
            }
            // console.log(this.date_range_each_date)
        },
    },
    async created()
    {
        moment.locale("zh-tw")
        this.date_range.push(moment().subtract(7,'d').format('YYYY-MM-DD 08:00:00'))
        this.date_range.push(moment().format('YYYY-MM-DD 08:00:00'))
        await this.CheckData()
    },
    methods: 
    {
        async CheckData()
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "/_db/VCP-30/_api/cursor",
                method: "POST",
                payload: {
                    "query": "FOR doc IN History \
                     SORT doc.STARTDATETIME DESC \
                     FILTER doc.`STARTDATETIME` <= '"+ moment(this.date_range[1]).add(1,'d').format('YYYY-MM-DD 08:00:00') +"' \
                     AND  doc.`STARTDATETIME` > '"+ moment(this.date_range[0]).subtract(1,'d').format('YYYY-MM-DD 08:00:00') +"' RETURN doc"
                },
            })
            this.list = response["result"]
            // console.log(this.list)
            this.loading = false
        },
    }
}
</script>

<style scoped>

</style>