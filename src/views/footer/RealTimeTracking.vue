<template>
  <div class="container">
    <!-- 地铁线路框 -->
    <div class="linesGroup">
      <!-- 标题 -->
      <div class="head">
        <img src="../../assets/imgs/route.svg" alt="线路" />
        <span>地铁线路</span>
      </div>

      <!-- 循环渲染 : 地铁线路 -->
      <div class="line">
        <div
          class="lineitem"
          v-for="(item, index) in lineData"
          :key="item.id"
          @click="clickLine(item.id)"
        >
          <div
            :style="{
              'border-color': item.color,
              'background-color':
                item.id == curId ? item.color : 'rgba(0,0,0,0)',
            }"
            class="check"
          ></div>
          <span @click="toStation(index)">{{ item.name.slice(4, 7) }}</span>
        </div>
      </div>
    </div>

    <!-- 地铁站点 -->
    <div class="stationsGroup">
      <!-- 标题 -->
      <div class="head">
        <img src="../../assets/imgs/subway.svg" alt="站点" />
        <span>地铁站点</span>
      </div>

      <!-- 循环渲染 : 路线站点 -->
      <div class="station">
        <div
          class="stationitem"
          v-for="(item, index) in stationNames"
          :key="index"
        >
          <div
            class="check"
            :style="{
              'background-color': item.passed ? 'white' : 'rgba(0,0,0,0)',
            }"
          ></div>
          <span @click="toStation(item.name)">
            {{ item.name }}
          </span>
        </div>
      </div>
    </div>
    <div classs="functionGroup"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useLineData } from "@/store";
import * as Cesium from "cesium";
import {
  getSiteTime,
  spaceDistance,
  getSampleData,
} from "../../cesiumTools/roamTools.js";
import SimpleLabel from "../../cesiumTools/Bubble/htmlMarker.js";

/* 01.加载的时候,默认获取地铁线路 */
const lineDataStore = useLineData();
let viewer;
let viewerEntities;
const stationNames = ref([]);
const lineData = ref([]);

onMounted(async () => {
  lineData.value = lineDataStore.lineData;
  viewer = lineDataStore.viewer;
  viewerEntities = viewer.entities.values;
  console.log(
    lineData.value,
    "地铁线路",
    viewer,
    "地图数据",
    viewerEntities,
    "地图上全部实体"
  );
  stationNames.value = lineData.value[0].stationsList.map((item) => {
    let obj = {
      name: item.name,
      passed: false,
    };
    return obj;
  });
});

/* 02.点击函数,实现站点显示 -- 获取地铁线路数据 */
const stationDatas = ref([]);
const curId = ref(1); // 初始化显示 1号线
const positions = ref([]);

const clickLine = (id) => {
  // 获取点击的 id + 轨道数据
  curId.value = id;
  let data = lineData.value.filter((item) => item.id == id);

  // 轨道数据 -- 轨道站点 + 站点名称
  stationDatas.value = data[0];
  stationNames.value = data[0].stationsList.map((item) => {
    let obj = {
      name: item.name,
      passed: false,
    };
    return obj;
  });
  console.log(stationNames.value, "站点的数组");

  // 加载轨道的笛卡尔坐标
  positions.value = [];
  data[0].paths.forEach((item) => {
    positions.value.push(Cesium.Cartesian3.fromDegrees(...Object.values(item)));
  });

  // 触发运行地铁
  toBegin(id);
};

/* 03.开始进行轨道函数 */
let entity, bubble, trainData;
const toBegin = (id) => {
  // 清空实体
  viewer.entities.removeById("running--subway");

  // 计算轨迹运行 总时间 + 轨迹点时间戳
  let timeObj = getSiteTime(positions.value, 150);

  // 开始的时间 -- 年/月/日
  const start = Cesium.JulianDate.fromDate(new Date(2024, 6, 26, 16));
  // 停止时间
  const stop = Cesium.JulianDate.addSeconds(
    start,
    timeObj.timeSum, // 运行的总时间
    new Cesium.JulianDate()
  );

  // 设置系统的时间
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone(); // 当前时间

  // 获取 地点+时间戳
  const position = getSampleData(positions.value, start, timeObj.siteTime);

  // 添加运行的 汽车模型
  entity = viewer.entities.add({
    // 关联时间
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start,
        stop,
      }),
    ]),
    // 加载模型
    model: {
      uri: "/src/assets/model/metro.gltf",
      minimumPixelSize: 30, // 最小尺寸
      scale: 0.2, // 缩放
    },
    id: "running--subway",
    position,
    orientation: new Cesium.VelocityOrientationProperty(position), // 根据位置调整朝向
  });

  // 获取或设置相机当前正在跟踪的Entity实例
  viewer.trackedEntity = entity;

  // 监听时间事件 -- 时间运行就会触发
  viewer.clock.onTick.addEventListener(tickEventHandler);

  trainData = {
    startIndex: id,
    currentPassengers: Math.ceil(Math.random() * 1000),
    startStation: startStationInfo,
    destination: endStationInfo,
    lineName: currentLine.value.name,
    currentSpeed: Math.ceil(Math.random() * 100),
    currentPosition: currentLine.value.paths[2],
  };
};

/* 执行轨迹到站停车 */
const tickEventHandler = () => {
  // 循环车的运行距离
  for (let i = 1; i < stationDatas.value.stationsList.length; i++) {
    // 点击的时候 起始点亮起
    stationNames.value[0].passed = true;

    // 获取当前时间的车的位置 -- 车的中心点的作标
    let curBusPosition = entity.position.getValue(viewer.clock.currentTime);

    // 获取小车站点的位置信息
    const stationPosition = Cesium.Cartesian3.fromDegrees(
      ...Object.values(stationDatas.value.stationsList[i].position)
    );

    // 计算小车距离下一站的距离
    let distance = spaceDistance(curBusPosition, stationPosition);

    // 小于一定距离 -- 公交停站
    if (distance < 10) {
      // 暂停时间
      viewer.clock.shouldAnimate = false;
      setTimeout(() => {
        // 1.5s之后 开启时间
        viewer.clock.shouldAnimate = true;
        // 设置到站显示
        stationNames.value[i].passed = true;
        // 运行完成之后,重新开始
        if (i == stationDatas.value.stationsList.length - 1) {
          alert("地铁已到站! 重新出发。");
          toBegin();
        }
      }, 1500);
    }
  }
};

/* 04.渲染气泡框 */
const renderBubble = (trainInfo) => {
  const { currentPosition, currentPassengers, lineName } = trainInfo;
  const position = new Cesium.Cartesian3.fromDegrees(
    currentPosition.lng,
    currentPosition.lat
  );

  // 添加弹窗
  bubble = new SimpleLabel({
    viewer: viewer,
    options: {
      position,
      label: null,
      isShow: true,
      color: "#fff",
      scaleByDistance: null,
      offset: [130, 205],
      attr: {
        currentPassengers,
        lineName,
      },
      type: "carPopup",
    },
  });

  // 添加label
  popupController.addLabel();
};

/* 05.点击跳转到针对应的站点 -- 点一下跳转;点两下返回实时地铁 */
let pickLabel = null;
const toStation = (name) => {
  // 如果反复点击,则返回跟踪
  if (pickLabel && pickLabel.name == name) {
    console.log(pickLabel.name, "选择的站点名称");
    viewer.trackedEntity = entity;
    pickLabel = null;
    return;
  }

  // 关闭轨道追踪 + 调整相机位置
  viewer.trackedEntity = null;
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

  // 查询实体,进行跳转
  pickLabel = viewerEntities.find((item) => item.name === name);
  viewer.flyTo(pickLabel, {
    duration: 2,
    maximumHeight: 20000,
    offset: {
      heading: Cesium.Math.toRadians(0.0), // 以弧度为单位的航向角。
      pitch: Cesium.Math.toRadians(-45), // 以弧度为单位的俯仰角。
      range: 1000, // 到中心的距离，以米为单位。
    },
  });
};

/* 06.实现组件注销 */
onBeforeUnmount(() => {
  // 清除所有数据
  viewer.entities.removeById("running--subway");
  viewer.trackedEntity = null;
});
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
