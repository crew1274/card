<template>
  <el-container>
    <el-header height="60px" >
        <center><h3>VCP-30</h3></center>
    </el-header>
      <el-main v-loading="loading" element-loading-text="拼命載入資料中"
      element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-row>
          <el-card header="上筆套用參數">
            <el-row>
              <el-card header="批號資料">
                <el-row>
                  <el-col :span="8">
                    料號: {{lotdata.itemno}}
                  </el-col>
                  <el-col :span="8">
                    批號: {{lotdata.no}}
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
                    孔銅需求: {{ppr_data.RD05M134}}(mil)
                  </el-col>
                  <el-col :span="8">
                    最小孔徑: {{ppr_data.RD05M146}}(mil)
                  </el-col>
                  <el-col :span="8">
                    面積(SQIN): {{ppr_data.RD05M49}}
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    板長: {{ppr_data.RD05M47}}(mm)
                  </el-col>
                  <el-col :span="8">
                    板寬: {{ppr_data.RD05M48}}(mm)
                  </el-col>
                  <el-col :span="8">
                    上料片數(不包含Dummy): {{ppr_data.PlatingPnl}}(片)
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    電鍍第一段補償時間: {{ppr_data.PlatingTime_1_offset}}(分鐘)
                  </el-col>
                  <el-col :span="8">
                    電鍍第二段補償時間: {{ppr_data.PlatingTime_2_offset}}(分鐘)
                  </el-col>
                  <el-col :span="8">
                    電鍍第三段補償時間: {{ppr_data.PlatingTime_3_offset}}(分鐘)
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
                      <el-table-column prop="name" label="" />
                      <el-table-column prop="current_time" label="電鍍時間 (min)"/>
                      <el-table-column prop="forward_current" label="正向電流 (A)"/>
                      <el-table-column prop="reverse_current" label="負向電流 (A)"/>
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
export default {
  name: 'Dashboard',
  data: function()
  {   
    return {
      loading: false,
      lotdata: {},
      ppr_data: {},
      ppr_result: [],
    }
  },
  async created()
  {
    await fetch("http://10.11.30.61:9999/api/prod", { method: 'GET'})
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
}
</script>

<style scoped>
  .el-card
  {
    margin-bottom: 15px;
  }
</style>