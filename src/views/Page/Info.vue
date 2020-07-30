<template>
    <div>
        <el-card class="hello" v-if="device=='VCP-30'">
            <el-row>
                <el-row>
                <el-card header="批號資料">
                    <el-row>
                    <el-col :span="8">
                        料號: {{info.lotdata.itemno}}
                    </el-col>
                    <el-col :span="8">
                        批號: {{info.lotdata.no}}
                    </el-col>
                    <el-col :span="8">
                        製程序: {{info.lotdata.procseq}}
                    </el-col>
                    </el-row>
                    <el-row>
                    </el-row>
                </el-card>
                <el-divider />
                <el-card header="生產資訊">
                    <el-row>
                        <el-col :span="8">
                            開始時間: {{info.STARTDATETIME}}
                        </el-col>
                        <el-col :span="8">
                            結束時間: {{info.ENDDATETIME}}
                        </el-col>
                        <el-col :span="8">
                            是否使用預測: {{info.ppr_data.pick_predict}}
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            上料方式: {{info.ppr_data.load_mode}}
                        </el-col>
                        <el-col :span="8">
                            電鍍需求: {{info.ppr_data.mode}}
                        </el-col>
                        <el-col :span="8">
                            電鍍方式: {{info.ppr_data.PPR_or_DC}}
                        </el-col>
                    </el-row>
                </el-card>
                <el-divider />
                <el-card header="參數資料">
                    <el-row>
                    <el-col :span="8">
                        孔銅需求: {{info.ppr_data.RD05M134}}(mil)
                    </el-col>
                    <el-col :span="8">
                        最小孔徑: {{info.ppr_data.RD05M146}}(mil)
                    </el-col>
                    <el-col :span="8">
                        面積(SQIN): {{info.ppr_data.RD05M49}}
                    </el-col>
                    </el-row>
                    <el-row>
                    <el-col :span="8">
                        板長: {{info.ppr_data.RD05M47}}(mm)
                    </el-col>
                    <el-col :span="8">
                        板寬: {{info.ppr_data.RD05M48}}(mm)
                    </el-col>
                    <el-col :span="8">
                        上料片數(不包含Dummy): {{info.ppr_data.PlatingPnl}}(片)
                    </el-col>
                    </el-row>
                    <el-row>
                    <el-col :span="8">
                        電鍍第一段補償時間: {{info.ppr_data.PlatingTime_1_offset}}(分鐘)
                    </el-col>
                    <el-col :span="8">
                        電鍍第二段補償時間: {{info.ppr_data.PlatingTime_2_offset}}(分鐘)
                    </el-col>
                    <el-col :span="8">
                        電鍍第三段補償時間: {{info.ppr_data.PlatingTime_3_offset}}(分鐘)
                    </el-col>
                    </el-row>
                </el-card>
                <el-divider />
                <el-card header="電鍍流程">
                    <el-row>
                    <el-table :data="info.ppr_result" style="font-size: 20px; width: 100%">
                        <el-table-column prop="name" label="" />
                        <el-table-column prop="current_time" label="電鍍時間 (min)"/>
                        <el-table-column prop="forward_current" label="正向電流 (A)"/>
                        <el-table-column prop="reverse_current" label="負向電流 (A)"/>
                    </el-table>  
                    </el-row>
                </el-card>
                </el-row>
            </el-row>
        </el-card>
        <el-card class="hello" v-else>
            <el-row>
                <el-card header="批號資料">
                    <el-row>
                        <el-col :span="6">
                            料號: {{info.lotdata.itemno}}
                        </el-col>
                        <el-col :span="6">
                            批號: {{info.lotdata.no}}
                        </el-col>
                        <el-col :span="6">
                            版次: {{info.lotdata.itemver}}
                        </el-col>
                        <el-col :span="6">
                            製造版次: {{info.lotdata.mfver}}
                        </el-col>
                    </el-row>
                </el-card>
                <el-divider />
                <el-card header="生產資訊">
                    <el-row>
                        <el-col :span="8">
                            開始時間: {{info.STARTDATETIME}}
                        </el-col>
                        <el-col :span="8">
                            結束時間: {{info.ENDDATETIME}}
                        </el-col>
                        <el-col :span="8">
                            是否使用預測: {{info.ppr_data.pick_predict}}
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                        上料方式: {{info.ppr_data.load_mode}}
                        </el-col>
                        <el-col :span="8">
                        電鍍需求: {{info.ppr_data.mode}}
                        </el-col>
                        <el-col :span="8">
                        電鍍方式: {{info.ppr_data.PPR_or_DC}}
                        </el-col>
                    </el-row>
                </el-card>
                <el-divider />
                <el-card header="參數資料">
                <el-row>
                    <el-col :span="8">
                        板寬: {{info.ppr_data.RD05M48}}(mm)
                    </el-col>
                    <el-col :span="8">
                        板高: {{info.ppr_data.RD05M47}}(mm)
                    </el-col>
                    <el-col :span="8">
                        Dummy板高: {{info.ppr_data.dummy_height}}(mm)
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        單片電流: {{info.ppr_data.PlatingAmp}}(A)
                    </el-col>
                    <el-col :span="8">
                        片數: {{info.ppr_data.PlatingPnl}}
                    </el-col>
                    <el-col :span="8">
                        電鍍時間: {{info.ppr_data.PlatingTime}}(分鐘)
                    </el-col>
                </el-row>
                </el-card>
                <el-divider />
                <el-card header="電鍍流程">
                <el-row>
                    <el-table :data="info.ppr_result" style="font-size: 20px; width: 100%">
                        <el-table-column prop="name" label="" width="180" />
                        <el-table-column prop="PlatingTime" label="電鍍時間 (min)" width="180" />
                        <el-table-column prop="P_PlatingAmp" label="正向電流 (A)" width="180" />
                        <el-table-column prop="N_PlatingAmp" label="負向電流 (A)" width="180" />
                    </el-table>  
                </el-row>
                </el-card>
            </el-row>
        </el-card>
    </div>
</template>

<script>
export default {
    name: "info",
    props:
    {
        info: Object,
        device: String,
    },
    created()
    {

    }
}
</script>

<style>

</style>