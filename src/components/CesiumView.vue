<template>
  <div id="cesium-viewer">
    <!-- 可以在插槽里面写一写ui之类的东西 -->
    <slot/>
  </div>
</template>

<script setup>
import * as Cesium from "cesium";
import {onMounted,markRaw} from "vue";
import app from "../main";
import {
  initViewer,
  setScene,
  loadTilesets,
  handleDefaultModelEffect,
  flyToDefaultView,
} from "../cesiumTools/sceneManager";
import {getLine} from '@/api/line'
import {useLineData} from '@/store'
const lineDataStore = useLineData()

//初始化cesium实例
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YmUzMTEzOC01MzlmLTRhN2MtOTAzMy1lOGEyYmU5MmFlMzIiLCJpZCI6NjM5NDEsImlhdCI6MTYzMzQ5NTIxN30.9u5kgq1kN6Z1GhuSQ4QbBUSdR9sY2XVbfEiZak-HN3Y";

onMounted(async () => {
  // 1, 初始化地图场景
  const viewer = initViewer("cesium-viewer");
  // 2, 设置后处理效果
  setScene(viewer);
  // 3, 视角飞到全局
  flyToDefaultView(viewer);
  const modelUrls = [{
    url: "http://localhost:8888/wuhan/tileset.json",
    options: {},
  }];
  lineDataStore.setViewer(markRaw(viewer))//设置viewer
  // 加载线路数据
  const lineData = await getLine()
  lineDataStore.setData(lineData)
  // 4, 加载多个3dtiles
  // 这里的tilesets相当于tile.readyPromise
  await loadTilesets(viewer, modelUrls, (tilesets) => {
    // 5, 处理模型着色
    handleDefaultModelEffect(tilesets[0]);
    // 使用provide将viewer和tilesets挂载到全局
    app.provide("$viewer_tile", {viewer, tilesets});
  });
});
</script>
<style>
#cesium-viewer {
  width: 100%;
  height: 100%;
  pointer-events: all;
}
</style>
