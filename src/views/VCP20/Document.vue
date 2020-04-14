<template>
    <el-container>
        <el-header height="60px" >
            <center>使用說明文件</center>
        </el-header>
        <el-main>
            <el-row :gutter="20">
                <el-col :span="4" :offset="8">
                    <el-button type="warning">上一頁</el-button>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary">下一頁</el-button>
                </el-col>
            </el-row>
            <pdf v-if="show" ref="pdf" style="border: 1px solid red" :src="src" :page="page" :rotate="rotate"
             @password="password" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event" 
             ></pdf>

            <div>
                <!-- <input type="checkbox" v-model="show">
                <select v-model="src" style="width: 30em">
                </select>
                <input v-model.number="page" type="number" style="width: 5em"> /{{numPages}}
                <button @click="rotate += 90">&#x27F3;</button>
                <button @click="rotate -= 90">&#x27F2;</button>
                <button @click="$refs.pdf.print()">print</button>
                <div style="width: 100%">
                    <div v-if="loadedRatio > 0 && loadedRatio < 1" style="background-color: green; color: white; text-align: center" :style="{ width: loadedRatio * 100 + '%' }">{{ Math.floor(loadedRatio * 100) }}%</div>
                    <pdf v-if="show" ref="pdf" style="border: 1px solid red" :src="src" :page="page" :rotate="rotate" @password="password" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event" @link-clicked="page = $event"></pdf>
                </div> -->
            </div>
        </el-main>
  </el-container>
</template>

<script>
    import pdf from 'vue-pdf'
    export default {
    components: {
        pdf: pdf
    },
    data () {
        return {
            show: true,
            src:'http://10.11.0.156/sample.pdf',
            loadedRatio: 0,
            page: 1,
            numPages: 0,
            rotate: 0,
        }
    },
    methods: {
        password: function(updatePassword, reason) {
 
            updatePassword(prompt('password is "test"'))
        },
        error: function(err)
        {
            console.log(err)
        }
    }
}
</script>

<style scoped>

</style>