<template>
  <div>
    <el-switch 
        v-model="feeding"
        active-text="人工投料 - 自動模式" active-color="#13ce66"
        inactive-text="人工投料 - 手動模式" inactive-color="#ff4949"
        @change="change_load_mode">
    </el-switch>  
  </div>
</template>

<script>
export default {
  name: "FeedModeSwitch",
  data: function()
  {
      return {
        feeding: false,
      }
  },
  async created()
  {
        await this.get_load_mode()
  },
  methods:
  {
    async get_load_mode()
    {
        await fetch("http://10.11.30.62:9999/api/load_mode",{ method: 'GET'})
        .then( response => {return response.json()})
        .then( response =>
        {
            if(response["Exception"])
            {
                throw response["Exception"]
            }
            if(response["response"] == "人工投料 - 自動模式")
            {
                this.feeding = true
            }
            else
            {
                this.feeding = false
            }
        })
        .catch( err =>
        {
            this.$notify.warning({ title: 'Edge異常回報', message: err})
        })
    },
    async change_load_mode()
    {
        await fetch("http://10.11.30.62:9999/api/load_mode",
        {   method: 'POST',
            body: JSON.stringify({'mode': this.feeding})
        })
        .then( response => {return response.json()})
        .then( response =>
        {
            console.log(response)
            if(response["Exception"])
            {
                throw response["Exception"]
            }
            if(response["response"])
            {
              this.$message({ message: "更動模式成功", type: "success"})
            }
        })
        .catch( err =>
        {
            this.$notify.warning({ title: 'Edge異常回報', message: err})
        })
        .finally( async () =>
        {
            await this.get_load_mode()
        })
    },
  }
};
</script>
