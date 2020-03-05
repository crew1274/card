<template>
    <el-container>
        <el-header height="60px" >
            <center>藥水添加記錄</center>
        </el-header>
        <el-main v-loading="loading">
            <!-- <el-table :data="show_data.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%"> -->
            <el-table :data="list" style="width: 100%">
                <el-table-column label="時間" prop="datetime" />
                <el-table-column label="藥劑" prop="potion" />
                <el-table-column label="動作" prop="action" />
            </el-table>
              <!-- <el-pagination layout="prev, pager, next" :total="50" :current-page="current_page" /> -->
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
        show_list : function()
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
            console.log(show_map)
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
            await fetch("http://10.11.30.61:9999/api/potion",
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
            })
            .catch( err =>
            {
                this.$notify.warning({ title: 'Edge資料庫存取異常', message: err})
            })
        },
    }
}
</script>

<style>
  .el-table .warning-row {
    background: #f15c66;
  }
</style>