<!--
 * @Description: 通用模版
 * @Author: jk
 * @Date: 2024-06-24 14:00:46
 * @LastEditTime: 2024-06-28 02:01:15
 * @FilePath: \wisdom-subway-system\src\views\footer\model\commonCard.vue
-->

<template>
  <div class="container">
    <!-- 地铁线路框 -->
    <div class="linesGroup">
      <!-- 标题 -->
      <div class="head">
       <!--  <img src="../../assets/imgs/route.svg" alt="线路" />
        <span>地铁线路</span> -->
      </div>

      <!-- 循环渲染 : 地铁线路 -->
      <div class="line">
        <div
          class="lineitem"
          v-for="item in lineData"
          :key="item.id"
          @click="clickLine(item.id)"
        >
          <div
            :style="{
              'border-color': item.color,
              'background-color': curId == item.id ? item.color : null,
            }"
            class="check"
          ></div>
          <span>{{ item.name.slice(4, 7) }}</span>
        </div>
      </div>
    </div>

    <!-- 功能板块 -->
    <div class="slotGroup">
      <!-- 标题 -->
      <div class="head">
        <slot name="head"></slot>
      </div>

      <!-- 循环渲染 : 路线站点 -->
      <div class="slot">
        <slot name="slot"></slot>
      </div>
    </div>
    <div classs="functionGroup"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from "vue";
import { useLineData } from "@/store";
// 假数据
// import { changeStations } from "../../store/staticData.js";

const curId = ref(0);
/* 加载的时候,默认获取地铁线路 */
const lineDataStore = useLineData();
const lineData = ref([]);
onMounted(async () => {
  lineData.value = lineDataStore.lineData;
});


// 子传父 所选路线id值
const $emit = defineEmits(['line-id'])
const clickLine = (id) => {
  // console.log(id, "点击函数");
  curId.value = id;
  $emit('line-id', id)
};
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  bottom: 7%;
  left: 28%;

  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;

  width: 42%;
  height: 22%;
  pointer-events: all;

  /* 地铁线 */
  .linesGroup {
    display: inline-block;
    height: 100%;
    width: 27%;

    border: 1px solid #ec9b02;
    padding: 10px;
    margin-right: 20px;
    background-color: #08080843;

    .head {
      margin-bottom: 10px;
      margin-top: 13px;
      img {
        height: 23px;
        margin-right: 5px;
      }
      span {
        position: relative;
        bottom: -5px;
        font-size: 20px;
        color: #ec9b02;
      }
    }
    .line {
      display: grid;
      grid-template-columns: repeat(2, 1fr);

      .lineitem {
        display: inline-block;
        width: 80px;

        padding: 4px;
        margin: 8px;
        border: 1px solid #ec9a028d;
        background-color: #ec9a021e;

        cursor: pointer;

        .check {
          display: inline-block;
          height: 14px;
          width: 14px;
          border: 1px solid white;
          margin-right: 5px;
        }
        span {
          font-size: 16px;
          color: aqua;
        }
      }
    }
  }

  /* 插槽 */
  .slotGroup {
    display: inline-block;

    height: 100%;
    width: auto;
    border: 1px solid #ec9b02;
    padding: 5px;
    background-color: #08080843;

    .head {
      margin-bottom: 10px;
    }

    .slot {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      padding: 8px 10px;
      height: 200px;
      max-height: 100%;
      max-width: 100%;
      overflow-block: hidden;
    }
  }
}
</style>
