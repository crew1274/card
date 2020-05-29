<template>
  <el-container>
    <el-header height="60px" >
        <center><h3>VCP-40</h3></center>
    </el-header>
      <el-main v-loading="loading" element-loading-text="拼命載入資料中"
      element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-row>
          <el-col :span="8">
            <el-switch 
              v-model="mode" :width="60"
              active-text="自動模式" active-color="#13ce66"
              inactive-text="手動模式" inactive-color="#ff4949"
              @change="open">
            </el-switch>
          </el-col>
          <el-col :span="8">
              <el-button type="danger" @click="reconnect(1)" icon="el-icon-setting">設備主站重新連線</el-button>
          </el-col>
          <el-col :span="8">
              <el-button type="danger" @click="reconnect(2)" icon="el-icon-setting">自動上下料系統重新連線</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-card header="上筆套用參數">
            <el-row>
              <el-card header="批號資料">
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
                <el-row>
                </el-row>
              </el-card>
              <el-card header="參數資料">
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
              <el-card header="電鍍流程">
                <el-row>
                  <el-table :data="ppr_result" style="font-size: 20px; width: 100%">
                      <el-table-column prop="name" label="" width="180" />
                      <el-table-column prop="PlatingTime" label="電鍍時間 (min)" width="180" />
                      <el-table-column prop="P_PlatingAmp" label="正向電流 (A)" width="180" />
                      <el-table-column prop="N_PlatingAmp" label="負向電流 (A)" width="180" />
                  </el-table>  
                </el-row>
              </el-card>
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
      lotdata: {},
      ppr_data: {},
      ppr_result: [],
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
    await fetch("http://10.11.30.60:9999/api/prod", { method: 'GET'})
    .then( response => {return response.json()})
    .then( response =>
    {
        if(response["Exception"])
        {
          throw response["Exception"]
        }
        this.lotdata = response["response"]["lotdata"]
        this.ppr_data = response["response"]["ppr_data"]
        this.ppr_result = response["response"]["ppr_result"]
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
      async reconnect(target)
      {
        this.loading = true
        await fetch("http://10.11.30.60:9999/api/reconnect/" + target,
        { method: 'GET'})
        .then( response => {return response.json()})
        .then( response =>
        {
            if(response["Exception"])
            {
              throw response["Exception"]
            }
            if(response["response"])
            {
              this.$message({ message: "重新連線成功", type: "success"})
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

<style>
.el-card
{
  margin-bottom: 15px;
}
.content
{
    font-size: 24px;
}
</style>