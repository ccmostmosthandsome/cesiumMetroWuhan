<template>
  <!-- 首页 -->
  <div class="home-page">
    <HomeHeader></HomeHeader>
    <HomeContainer></HomeContainer>
    <HomeFooter></HomeFooter>
    <router-view></router-view>
  </div>
</template>

<script setup>
import HomeHeader from "../components/HomePage/HomeHeader.vue";
import HomeContainer from "../components/HomePage/HomeContainer.vue";
import HomeFooter from "../components/HomePage/HomeFooter.vue";
</script>

<style lang="scss" scoped>
.home-page {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}
</style>
