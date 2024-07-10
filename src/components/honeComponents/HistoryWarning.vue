<template>
  <div id="historyChart"></div>
</template>

<script setup>
import { historyWarning } from "@/cesiumTools/echartsOpts";
import * as echarts from "echarts";
import { onMounted } from "vue";
import {historyWarningData} from '@/store/staticData'

onMounted(() => {
  initChart();
});

const initChart = () => {
  const myChart = echarts.init(document.getElementById("historyChart"));
  const options = historyWarning(historyWarningData);
  myChart.setOption(options);
};
</script>
<style scoped lang="scss">
  #historyChart{
    width: 100%;
    height:100%;
    padding: 0 10px 10px 10px;
  }
</style>
