
<template>
  <div id="content" v-if="baseMode">
    <div class="contLeft">
      <Panel title="运营统计">
        <template #content>
          <operate-static></operate-static>
        </template>
      </Panel>
      <Panel title="地铁活动">
        <template #content>
          <rail-way-activity></rail-way-activity>
        </template>
      </Panel>
      <Panel title="客流指标">
        <template #content>
          <guests-rate></guests-rate>
        </template>
      </Panel>
    </div>

    <div class="contRight">
      <Panel title="线路概览">
        <template #content>
          <line-scan/>
        </template>
      </Panel>
      <Panel title="告警趋势">
        <template #content>
          <history-warning></history-warning>
        </template>
      </Panel>
      <Panel title="实时影像">
        <template #content>
            <HlsLive></HlsLive>
        </template>
      </Panel>
    </div>
  </div>

<!--  <div class="router-wrapper">-->
<!--    <router-view></router-view>-->
<!--  </div>-->
</template>

<script setup>
import Panel from "../honeComponents/Panel.vue";
import router from "@/router";
import { ref, watch } from "vue";
import HlsLive from "@/components/honeComponents/HlsLive.vue";
import LineScan from "@/components/honeComponents/LineScan.vue";
import RailWayActivity from "@/components/honeComponents/RailWayActivity.vue";
import GuestsRate from "@/components/honeComponents/GuestsRate.vue";
import HistoryWarning from "@/components/honeComponents/HistoryWarning.vue";
import OperateStatic from "@/components/honeComponents/OperateStatic.vue";

const baseMode = ref(true);

// 监听当前路由
watch(router.currentRoute, (value) => {
  console.log(value);
  if (value.fullPath === "/SiteManagement") {
    baseMode.value = false;
  } else {
    baseMode.value = true;
  }
});
</script>
<style scoped>
#content {
  color: white;
  position: relative;
  width: 100%;
  height: calc(100% - 130px);
  padding: 0 0.833vw;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .contLeft,.contRight{
    width: 27%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.router-wrapper {
  position: absolute;
  z-index: 100;
  top: 0;
  width: 100%;
  height: calc(100% - 90px);
}
</style>
