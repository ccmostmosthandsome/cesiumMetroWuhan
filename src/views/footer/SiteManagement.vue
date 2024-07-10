<template>
  <div class="wrapper">
    <!-- 左侧 -->
    <div class="left-wrapper">
      <div class="query-controller">
        <div class="title">查询模式选择</div>
        <div class="divide"></div>
        <div class="query-item" v-for="item in stationMangeItems">
          <i
            :class="[
              'iconfont',
              item.icon,
              'commonIcon',
              item.active ? 'commonIconActive' : '',
            ]"
          ></i>
          <span
            :class="[
              'query-item-title',
              item.active ? 'query-item-title-active' : '',
            ]"
            @click="chooseQuery(item)"
          >
            {{ item.title }}
          </span>
        </div>
      </div>
    </div>
    <!-- 右侧 -->
    <div class="right-wrapper">
      <div class="controller">
        <div style="display: flex; gap: 10px">
          <span class="title">图标</span>
          <span class="title">站控措施</span>
        </div>
        <div class="controller-item" v-for="item in station_solutions">
          <i :class="['iconfont', item.iconName, 'commonIcon']"></i>
          <span class="controller-item-title">{{ item.title }}</span>
        </div>
      </div>
    </div>
    <!-- 中间 -->
    <div class="container" v-if="!data.isShowRouteDesign">
      <!-- 地铁线路框 -->
      <div class="linesGroup">
        <!-- 标题 -->
        <div class="head title-bg">
          <i class="iconfont metro-lineRoute"></i> 地铁线路
        </div>

        <!-- 循环渲染 : 地铁线路 -->
        <div class="line">
          <div
            class="lineitem"
            v-for="item in data.subLineData"
            :key="item.id"
            @click="handleItemClick(item)"
          >
            <div
              :style="{
                'border-color': item.color,
                backgroundColor: item.choosed ? item.color : 'rgba(0,0,0,0)',
              }"
              class="check"
            ></div>
            <span>{{ item.name.slice(4, 7) }}</span>
          </div>
        </div>
      </div>

      <!-- 地铁站点 -->
      <div class="stationsGroup">
        <!-- 标题 -->
        <div class="head title-bg">
          <i class="iconfont metro-ditie"></i> 地铁站点
        </div>

        <!-- 循环渲染 : 路线站点 -->
        <div class="station">
          <div
            class="stationitem"
            v-for="(item, index) in data.stationData"
            :key="index"
          >
            <div
              class="check"
              :style="{
                'background-color': item.passed ? 'white' : 'rgba(0,0,0,0)',
              }"
            ></div>
            <span @click="chooseStation(item)">
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
      <div classs="functionGroup"></div>
    </div>
    <!-- 路徑規劃 -->
    <RouteDesign v-if="data.isShowRouteDesign"></RouteDesign>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
// pinia
import useSiteStore from "@/store/siteMessage";
const siteStore = useSiteStore();
import { useLineData, useMeasureData } from "@/store";
const measureDataStore = useMeasureData();
const lineData = useLineData();
// 热力图
import { drawHeatMap } from "@/cesiumTools/heat/drawHeatMap";
// 聚焦到站点并展示查询信息
import {
  focusOnStation,
  binkLineByName,
  flyToDefaultView,
} from "@/cesiumTools/effectController.js";
// 组件
import RouteDesign from "@/components/RouteDes/RouteDesign.vue";

const { stationMangeItems, station_solutions } = storeToRefs(siteStore);

/* 定义数据 */
const data = reactive({
  subLineData: [], //地铁线路数据
  scrum: [], //站点拥挤数据
  controllerData: [], //站控措施数据
  isShowRouteDesign: false, //路径规划

  currentLine: "", //当前线路
  stationData: [], //存储的站点信息(渲染)
});
let viewer, removeHeat;

onMounted(async () => {
  // 1, 地铁线路数据
  data.subLineData = await lineData.allData;
  data.subLineData = data.subLineData.map((item) => {
    return { ...item, choosed: false };
  });
  // 2, 站点拥挤数据
  data.subLineData.forEach((item) => {
    item.stationsList.forEach((station) => {
      const { position } = station;
      data.scrum.push({
        x: position.lng,
        y: position.lat,
        value: Math.ceil(Math.random() * 1000),
        // value: station.peopleFlow,
      });
    });
  });
  viewer = lineData.Viewer;
});

/* 点击事件 */
const chooseQuery = (item) => {
  recoverEffect();
  flyToDefaultView(viewer);
  // 1-1, 更改点击状态
  stationMangeItems.value.forEach((i) => {
    i.active = false;
  });
  const target = stationMangeItems.value.find((i) => i.title === item.title);
  if (target) {
    target.active = !target.active;
    if (item.title == "站点拥挤度") {
      // 1-2, 热力图
      renderClowed(viewer, data.scrum);
    } else if (item.title == "周边查询") {
    } else if (item.title == "路径规划") {
      data.isShowRouteDesign = !data.isShowRouteDesign;
    } else if (item.title == "站控措施") {
      // 1-3, 站控措施
      renderStationMeasure();
    }
  }
};
// 1-2, 热力图(站点拥挤度)
const renderClowed = (viewer, scrum) => {
  removeHeat = drawHeatMap(viewer, scrum);
};
// 1-3, 站控措施
const renderStationMeasure = () => {
  // 1-3-1, 生成一个指定范围内的随机整数(包括最大值和最小值的)
  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min); //向上取整
    max = Math.floor(max); //向下取整
    return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值
  };
  // 1-3-2, 从数组中随机取几个数(Fisher-Yates 洗牌算法)
  const getRandomArrayValue = (arr, num) => {
    var sData = arr.slice(0); //创建副本,避免污染数据
    var i = arr.length;
    var min = i - num;
    var item, index;
    // 同for (var i = arr.length - 1; i > min; i--)
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      item = sData[index];
      sData[index] = sData[i];
      sData[i] = item;
    }
    return sData.slice(min);
  };
  // 1-3-3, 创建站控措施数组
  data.subLineData.forEach((item) => {
    const res = item.stationsList.map((station) => {
      // 注意: 这里的随机数需要放在遍历里面!!!
      let measureNum = getRandomIntInclusive(0, 5); //随机整数
      let measures = getRandomArrayValue(station_solutions.value, measureNum); //随机站控措施
      return {
        name: station.name,
        measures,
      };
    });
    data.controllerData.push(res);
  });
  // 全局共享站控措施数据???????
  measureDataStore.setData(data.controllerData);
};
// 1-5, 清除
const recoverEffect = () => {
  removeHeat && removeHeat();
  data.isShowRouteDesign = false;
  measureDataStore.clearData();
};
/* ===========================飞======================= */
//地铁线路
const handleItemClick = (item) => {
  const { stationsList, id, name } = item;
  data.currentLine = name;
  data.stationData = stationsList;
  data.subLineData = data.subLineData.map((n) => {
    n.choosed = id === n.id;
    return n;
  });
  binkLineByName(name);
  flyToDefaultView(viewer);
};
// 站点列表
const chooseStation = (item) => {
  focusOnStation(viewer, item.name);
  data.stationData = data.stationData.map((station) => {
    if (station.name === item.name) {
      station.choosed = true;
    } else {
      station.choosed = false;
    }
    return station;
  });
};

/* 卸载 */
onUnmounted(() => {
  recoverEffect();
});
</script>

<style lang="scss" scoped>
.title {
  margin-bottom: 4px;
  font-size: 25px;
}
// 图标
.commonIcon {
  padding: 2px 6px;
  font-size: 24px;
  // background: url("/src/assets/uiResources/icon-wrapper.png"); //未激活
  background-size: 100% 100%;
  background-repeat: no-repeat;
  pointer-events: all;
  cursor: pointer;

  &:hover {
    // background: url("/src/assets/uiResources/icon-wrapper-active.png"); //激活
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}
.commonIconActive {
  // background: url("/src/assets/uiResources/icon-wrapper-active.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  color: #11916b;
}
// 文字
.query-item-title,
.controller-item-title {
  // display: inline-block;
  padding: 3px 10px;
  font-size: 20px;
  margin-left: 26px;
  // background: url("/src/assets/uiResources/button.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
  pointer-events: all;

  &:hover {
    // background: url("/src/assets/uiResources/button-active.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}
// 左侧---按钮左边的线
.query-item-title::after {
  content: "";
  width: 15px;
  height: 1px;
  background-color: rgba(224, 193, 193, 0.693);
  position: absolute;
  top: 50%;
  left: -14px;
}
//右侧---按钮左边的线
.controller-item-title::after {
  content: "";
  width: 24px;
  height: 1px;
  background-color: rgba(224, 193, 193, 0.693);
  position: absolute;
  top: 50%;
  left: -24px;
}
.query-item-title-active {
  // background: url("/src/assets/uiResources/button-active.png"); //激活
  background-size: 100% 100%;
  background-repeat: no-repeat;
  color: #11916b;
}

/* ============================================================== */
.wrapper {
  width: 100%;
  height: 100%;
  color: #fff;

  // 左侧
  .left-wrapper {
    height: 100%;
    position: absolute;
    left: 0;
    top: 2.083vw;
    .query-controller {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-left: 1.771vw;
      margin-top: 1.042vw;

      // 分割线
      .divide {
        width: 1px;
        height: 86%;
        position: absolute; //子绝父相
        top: 37px;
        left: 50px;
        background-color: rgba(224, 193, 193, 0.693);
      }

      // 选择里面的内容
      .query-item {
        margin: 4px;
      }
    }
  }

  // 右侧
  .right-wrapper {
    height: 100%;
    position: absolute;
    right: 0;
    top: 2.083vw;
    .controller {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-right: 1.771vw;
      margin-top: 1.042vw;
    }
  }
}
// ===========================
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

  /* 站点 */
  .stationsGroup {
    display: inline-block;

    height: 100%;
    width: 1fr;
    border: 1px solid #ec9b02;
    padding: 5px;
    background-color: #08080843;

    .head {
      margin-bottom: 10px;
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

    .station {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      padding: 8px 10px;
      height: 180px;
      max-height: 100%;
      max-width: 100%;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        width: 3px;
        height: 10px;
      }

      .stationitem {
        // display: inline-block;
        width: 92px;
        height: 28px;
        padding: 4px;
        margin: 4px 8px;
        border: 1px solid #ec9a0297;
        background-color: #ec9a021e;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background-color: rgba(255, 255, 0, 0.5);
          cursor: pointer;
        }

        .check {
          display: inline-block;
          height: 14px;
          width: 14px;
          border: 1px solid white;
          margin-right: 4px;
          transform: translateY(-2px);
        }
        span {
          display: inline-block;

          width: 64px;
          max-width: 100%;
          font-size: 16px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-wrap: normal;
          color: aqua;
        }
      }
    }
  }
}
</style>
