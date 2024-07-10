<template>
  <div>
    <div class="center-wrapper" v-if="!isInRouteDesign">
      <!-- 地铁线路 -->
      <div id="subLine-controller">
        <div class="title-bg">
          <i class="iconfont metro-lineRoute"></i> 地铁线路
        </div>
        <div class="item-wrapper">
          <div
            class="item"
            v-for="item in subLineData"
            @click.stop="handleItemClick(item)"
          >
            <div
              class="box"
              :style="{
                borderColor: item.color,
                backgroundColor: item.choosed ? item.color : 'rgba(0,0,0,0)',
              }"
            ></div>
            <span :style="{ color: '#34c5cf' }">{{ item.name.slice(-3) }}</span>
          </div>
        </div>
      </div>
      <!-- 站点列表 -->
      <div id="station-controller">
        <div class="title-bg">
          <i class="iconfont metro-ditie"></i> 地铁站点
        </div>
        <div class="item-wrapper">
          <div
            class="item"
            v-for="item in stationData"
            @click="chooseStation(item)"
          >
            <div
              class="box"
              :style="{
                backgroundColor: item.choosed ? '#fff' : 'rgba(0,0,0,0)',
              }"
            ></div>
            <span :style="{ color: '#34c5cf' }">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
