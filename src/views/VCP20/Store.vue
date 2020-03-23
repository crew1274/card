<template>
    <el-container>
        <el-header height="60px" >
            <center>儲存參數列表</center>
        </el-header>
        <el-main v-loading="loading" element-loading-text="拼命載入資料中"
            element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
            <el-table :data="show_data.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%">
                <el-table-column label="名稱" prop="name" />
                <el-table-column align="right">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" @click="handleCheck(scope.row)">查看詳細</el-button>
                        <el-button size="mini" type="danger" @click="handleDelete(scope.row)">刪除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-dialog title="確定要刪除參數?" :visible.sync="deleteDialogVisible" width="50%">
            <span slot="footer" class="dialog-footer">
                <el-button type="info" @click="deleteDialogVisible = false">我按錯了</el-button>
                <el-button type="danger" @click="confrimDelete">確定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="參數詳細資訊" :visible.sync="recipeDialogVisible" width="80%" >
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
                <el-col :span="4" :offset="2">
                    <el-button @click="callAGV" type="success" icon="el-icon-phone">呼叫AGV</el-button>
                </el-col>
            </el-row>
        </el-dialog>
  </el-container>
</template>

<script>
export default
{
    async beforeMount()
    {
        await this.CheckData()
    },
    data()
    {
        return {
            loading: false,
            search: "",
            token: "",
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
        show_data()
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
        async CheckData()
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-20/_api/simple/all-keys",
                method: "PUT",
                payload: {collection: "Warehouse"},
            })
            this.result = response["result"]
            this.loading = false
        },
        async handleCheck(row)
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-20/_api/document/Warehouse/" + row["name"],
                method: "GET",
                payload: {},
            })
            this.ppr_data = response["ppr_data"]
            this.lotdata = response["lotdata"]
            this.lotdata["source"] = row["name"]
            this.recipeDialogVisible = true
            this.loading = false
        },
        handleDelete(row)
        {
            this.deleteDialogVisible = true
            this.delete_name = row["name"]
        },
        async confrimDelete()
        {
            this.loading = true
            let response = await this.$store.dispatch("_db", { 
                url: "_db/VCP-20/_api/document/Warehouse/" + this.delete_name,
                method: "DELETE",
                payload: {},
            })
            if(!response["error"])
            {
                this.$message({ message: "刪除成功", type: "success"})
            }
            await this.CheckData()
            this.deleteDialogVisible = false
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
            await fetch("http://10.11.30.60:9999/api/PLC/temp",
            {   method: 'POST',
                body: JSON.stringify({
                    ppr_result: this.ppr_result, 
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
        async callAGV()
        {
            this.loading = true
            await fetch("http://10.11.30.60:9999/api/CallAGV", {method: 'POST'})
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
            .finally( () => 
            {
                this.loading = false
            })
        }
    }
}
</script>

