<template>
  <el-container>
    <el-header height="60px" >
        <center><h3>VCP-30</h3></center>
    </el-header>
      <el-main v-loading="loading" element-loading-text="拼命載入資料中"
      element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
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
      
    }
  },
}
</script>