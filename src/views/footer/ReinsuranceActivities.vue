<template>
  <div class="line">
    <div class="item-wrapper">
      <div
        class="item"
        v-for="item in subLineData"
        @click="handleItemClick(item)"
      >
        <div
          class="box"
          :style="{ borderColor: item.color, backgroundColor: item.color }"
        ></div>
        <span :style="{ color: '#34c5cf' }">{{ item.name.slice(-3) }}</span>
      </div>
    </div>
  </div>
  <div class="active_panel">
    <div class="header">
      <strong>重点活动</strong>
      <span>{{ date }}</span>
    </div>
    <div class="content">
      <div class="active-wrapper" v-if="activitiesData.length">
        <div
          v-for="item in activitiesData"
          :key="item.id"
          class="acitve-item"
          @click="clickActiveItem(item)"
        >
          <div>{{ item.activedTime }}</div>
          <div>{{ item.activedPlace }}</div>
          <div>{{ item.activedTime }}</div>
        </div>
      </div>
      <!-- 安装 Ant Design Vue 当没有数据的时候显示无数据 -->
      <a-empty v-else :image="simpleImage" description="无数据" />
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref, onBeforeUnmount } from "vue";
import { useLineData } from "@/store";
import { activity } from "@/store/staticData";
import {
  flyToLine,
  binkLineByName,
  addGradientCone,
  removeAllCones,
  flyToCone,
} from "@/cesiumTools/effectController";
const lineData = useLineData();
// const subLineData = lineData.alldata
const subLineData = ref([]);

// 拿到所有线路信息
let viewer;
onMounted(() => {
  // 获取全局viewer
  viewer = lineData.Viewer;
  // 去除Promise
  let p = lineData.allData;
  p.then((res) => {
    subLineData.value = res;
  });
});

// 获取时间
const date = computed(() => {
  return dayjs().format("YYYY-MM-DD");
});
/* ------------------------------------------------获取重保活动及线路的数--------------------------------------------------- */
// 创建重点活动列表
const activitiesData = ref([]);
/* 重保活动的数据在 staticData中*/
// activitiesData.value = activity;
// 创建当前站点信息
const currentStation = ref([]);
/* -------------------------------------点击线路，线路闪烁 handleItemClick（item）(同时改变光柱样式)---------------------- */
const handleItemClick = (item) => {
  // console.log(item, "item111111111111111111111111111111111111111111");
  const { name, color, stationsList } = item;
  // 根据线路名称闪烁线路
  binkLineByName(name);
  // 根据名称视角跳转到对应线路
  flyToLine(viewer, name);
  // 点击各线路都会出现重保活动
  activitiesData.value = activity;
  // 获取当前站点信息,为后面更改光柱样式做准备
  currentStation.value = stationsList;
  // 改变光柱样式 (传递addGradientCone需要的颜色属性)
  changestyle(color);
};

/* -------------------------------------------------改变光柱样式------------------------------------------------------- */
const changestyle = (color) => {
  // 1、清除所有样式
  removeAllCones(viewer);
  // 拿到重保活动的Id
  const id = activitiesData.value.map((item) => item.id);

  /* 只有4个重保活动的假数据，所以，每条线上的高亮光柱都参照这4个假数据的id值 */
  // console.log(currentStation,'currentStation')
  const res = currentStation.value.map((item, index) => {
    item.id = index; // 为每个元素添加id属性，值为当前索引
    return item; // // 返回修改后的元素
  });
  // console.log(res,'res')

  // 过滤出每条线要高亮的站点
  const lightStation = res.filter((item) => id.includes(item.id));
  // console.log(lightStation,'lightStation')

  // 改变光柱样式
  lightStation.forEach((item) => {
    // 拿到坐标
    const { position, id } = item;
    // 改变光柱样式
    addGradientCone(viewer, {
      position,
      color,
      name: id,
    });
  });
};

/* -------------------------------------------点击某一个重保活动，跳转到相应位置并高亮该活动------------------------------ */
const clickActiveItem = (item) => {
  // 获取活动ID
  const { id } = item;
  // console.log(id, "id222222222222222222222222222222222222");
  // 视角飞到圆柱
  flyToCone(viewer, id);
};
/* -------------------------------------------------------组件销毁---------------------------------------------------- */
onBeforeUnmount(() => {
  // 清除所有光柱样式
  removeAllCones(viewer);
});
</script>

<style lang="scss" scoped>
.line {
  position: absolute;
  width: 146px;
  height: 140px;
  left: 34%;
  bottom: 10%;
  transform: translateX(-50%);
  border: 1px solid #ab7818;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}
.box {
  width: 10px;
  height: 10px;
  border-width: 1px;
  border-style: solid;
  background: transparent;
  user-select: all;
  cursor: pointer;
}

.item {
  width: 65px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid #885f12;
  color: #fff;
  font-size: 10px;
  pointer-events: all;
  cursor: pointer;
}

.item:hover {
  border: 1px solid #d8961a;
}

.item > span {
  line-height: 9.005px;
}

.item > input {
  outline: none;
  border: none;
  transition: all 0.3s ease;
}

.item-wrapper {
  display: flex;
  justify-content: space-between;
  align-content: space-around;
  flex-wrap: wrap;
  flex: 1;
}

.active-panel {
  width: 500px;
  height: 140.006px;
  border: 1px solid #ab7818;
  background-color: rgba(0, 0, 0, 0.3);
  position: absolute;
  left: 39%;
  bottom: 0;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.active_panel {
  width: 500px;
  height: 140.006px;
  border: 1px solid #ab7818;
  background-color: rgba(0, 0, 0, 0.3);
  position: absolute;
  left: 39%;
  bottom: 10%;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* background-clip: text;: 标准语法，将背景裁剪到文本内容。
-webkit-background-clip: text;指定背景的裁剪区域为文本内容。该属性告诉浏览器将背景应用到文本本身，而不是其周围的元素。
-webkit-text-fill-color: transparent;设置文本的填充颜色。将文本颜色设置为透明，使背景图像或渐变通过文本显示出来。
 */
  .header {
    height: 30px;
    padding: 10px;
    background: rgb(255, 255, 255);
    background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 9%,
      rgba(211, 156, 50, 1) 57%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: "等线Bold";
    margin-bottom: -0.521vw;
    strong {
      font-weight: normal;
      margin-right: 10px;
    }
    span {
      font-size: 12px;
    }
  }
  .content {
    flex: 1;
    .active-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 100%;
      .acitve-item {
        width: 150px;
        height: 70px;
        border: 1px solid #ab7818;
        background-color: rgba(214, 174, 41, 0.1);
        margin: 4px;
        text-align: center;
        pointer-events: all;
        cursor: pointer;
        color: #37b3bb;
        // transition: all 0.3s linear;
        padding-top: 12px;
        font-size: 12px;
        &:hover {
          background-color: rgba(214, 174, 41, 0.3);
          color: #fff;
        }
      }
      .item-active {
        background-color: rgba(214, 174, 41, 0.3);
        color: #fff;
      }
    }
  }
}
</style>
