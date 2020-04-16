<template>
  <el-container>
    <el-header height="60px" >
        <center><h3>VCP-20</h3></center>
    </el-header>
      <el-main v-loading="loading" element-loading-text="拼命載入資料中"
      element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-row>
          <el-switch 
            v-model="mode" :width="60"
            active-text="自動模式" active-color="#13ce66"
            inactive-text="手動模式" inactive-color="#ff4949"
            @change="open">
          </el-switch>
        </el-row>
        <el-row>
          <el-card header="上筆套用參數">
            <el-row>
            </el-row>
          </el-card>
        </el-row>
        <el-row>
          <el-card header="設備即時狀態">
            努力開發中...
          </el-card>
        </el-row>
      </el-main>
  </el-container>
</template>

<script>
export default
{
  name: 'Dashboard',
  data: function()
  {   
    return {
      loading: false,
      mode: true,
    }
  },
  async created()
  {
    await fetch("http://10.11.30.60:9999/api/mode", { method: 'GET'})
    .then( response => {return response.json()})
    .then( response =>
    {
        if(response["Exception"])
        {
          throw response["Exception"]
        }
        if(response["response"] == "自動模式")
        {
          this.mode = true
        }
        else
        {
          this.mode = false
        }
    })
    .catch( err =>
    {
        this.$notify.warning({ title: 'Edge異常回報', message: err})
    })
  },
  methods: 
  {
      open()
      {
        this.$confirm('確認切換運轉模式 是否繼續?', '提示',
        {
          confirmButtonText: '確定',
          cancelButtonText: '我按錯了',
          type: 'warning',
          center: true,
          roundButton: true,
        })
        .then(() => {
          //call function
          this.changeMode()
        })
        .catch(() => {
          //rollback
          this.mode = !this.mode
        })
      },
      async changeMode()
      {
        this.loading = true
        await fetch("http://10.11.30.60:9999/api/mode",
        {   method: 'PUT',
            body: JSON.stringify({
                mode: (this.mode ? "自動模式": "手動模式"),
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
              this.$message({ message: "更動模式成功", type: "success"})
            }
            else
            {
              this.$message({ message: "更動模式失敗", type: "error"})
              this.mode = !this.mode
            }
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