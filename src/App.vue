<template>
  <!-- 大屏自适应小插件 -->
  <v-scale-screen width="1920" height="1080" :delay="200">

    <!-- 需要缓存的视图组件 -->
    <keep-alive>
      <CesiumView>
        <tool-bar></tool-bar>
      </CesiumView>
    </keep-alive>

    <router-view></router-view>

  </v-scale-screen>
</template>

<script setup>
import VScaleScreen from "v-scale-screen";
import CesiumView from "./components/CesiumView.vue";
import ToolBar from "@/components/honeComponents/tools/toolBar.vue";
</script>

<style>
</style>
