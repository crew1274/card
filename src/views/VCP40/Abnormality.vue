<template>
    <el-container>
        <el-header height="60px" >
            <center>異常履歷</center>
        </el-header>
        <el-main v-loading="loading">
            <!-- <el-table :data="show_data.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%"> -->
            <el-table :data="show_list" style="width: 100%" :row-class-name="tableRowClassName">
                <el-table-column label="開始時間" prop="start_time" />
                <el-table-column label="結束時間" prop="end_time" />
                <el-table-column label="詳細訊息" prop="message" />
                <el-table-column label="來源" prop="device" />
            </el-table>
              <!-- <el-pagination layout="prev, pager, next" :total="50" :current-page="current_page" /> -->
        </el-main>
  </el-container>
</template>

<script>
export default
{
    async created()
    {
        await this.CheckData()
    },
    data()
    {
        return {
            loading: false,
            search: "",
            token: "",
            list : [],
            deleteDialogVisible: false,
            recipeDialogVisible: false,
            current_page: "",
            pagination_list: [],
        }
    },
    computed:
    {
        show_list()
        {
            let show_map = {}
            let show_list = []
            this.list.forEach( (element) =>
            {
                if(element["message"] in show_map)
                {
                    show_map[element["message"]]["end_time"] = element["datetime"]
                    show_list.push(show_map[element["message"]])
                    delete show_map[element["message"]]
                }
                else
                {
                    show_map[element["message"]] = element
                    show_map[element["message"]]["start_time"] = element["datetime"]
                }
            })
            Object.keys(show_map).forEach( element =>
            {
                show_map[element]["start_time"] = show_map[element]["datetime"]
                show_map[element]["end_time"] = ""
                show_list.push(show_map[element])
            })
            return show_list.reverse()
        }
    },
    methods: 
    {
        async CheckData()
        {
            this.loading = true
            await fetch("http://10.11.30.62:9999/api/error",
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
                this.list = response["result"].reverse()
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge資料庫存取異常', message: err})
            })
            .finally( () => {
                this.loading = false
            })
        },
        
        tableRowClassName({row})
        {
            if (row["end_time"] == "")
            {
                return 'warning-row'
            }
            else
            {
                return ''
            }
        }
    }
}
</script>

<style scoped>
  .el-table >>> .warning-row
  {
    background: #f15c66;
  }
</style>