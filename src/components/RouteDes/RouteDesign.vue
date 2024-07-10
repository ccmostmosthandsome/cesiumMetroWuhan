<template>
  <div class="route-design-wrapper">
    <div class="route-design">
      <!-- 头部 -->
      <div class="header">
        <i class="iconfont metro-lujingguihua" style="font-size: 20px"></i>
        <span style="margin-left: 5px; font-size: 20px">路径规划</span>
        <button class="start-btn" @click="enterDesign">
          {{ data.isDesign ? "离开规划模式" : "进入规划模式" }}
        </button>
      </div>
      <!-- 中间 -->
      <div class="content">
        <div>
          <span style="margin-right: 5px; font-size: 20px">起点:</span>
          <a-cascader
            v-model:value="data.startStation"
            :options="data.options"
            placeholder="请输入起点站"
          >
            <template #clearIcon>
              <i class="iconfont metro-close"></i>
            </template>
          </a-cascader>
          <!-- <a-button style="margin-left: 8px" @click="pickStation('origin')">拾取起点站</a-button> -->
        </div>
        <div>
          <span style="margin-right: 5px; font-size: 20px">终点:</span>
          <a-cascader
            v-model:value="data.endStation"
            :options="data.options"
            placeholder="请输入终点站"
            ><template #clearIcon>
              <i class="iconfont metro-close"></i>
            </template>
          </a-cascader>
          <!-- <a-button style="margin-left: 8px" @click="pickStation('destination')">拾取终点站</a-button> -->
        </div>
      </div>
    </div>
    <!-- 路径规划展示面板 -->
    <PathDesignDisplayCard
      v-if="data.isDesign"
      :routeInfo="data.routeInfo"
      :cacheData="cacheData"
    ></PathDesignDisplayCard>
  </div>
</template>

<script setup>
import { onMounted, reactive, onUnmounted } from "vue";
// pinia
import { useLineData } from "@/store";
const lineData = useLineData();
import { lineColors } from "@/store/staticData";
// ant组件
import { message } from "ant-design-vue";
// 请求的api数据
import { getLinePlan } from "@/api/line";
// 组件
import PathDesignDisplayCard from "./PathDesignDisplayCard.vue";
// 函数
// import {
//   renderStation,
//   renderLines,
//   renderStationBill,
// } from "@//cesium_dev_helper/traffic/metro/index.js";
// import { removeByCacheData } from "@/cesium_dev_helper/traffic/metro/all.js";
// import { flyToDefaultView } from "@/cesiumTools/myFramwork/home/effectController.js";
import {
  renderStation,
  renderLines,
  renderStationBill,
  removeByCacheData,
  flyToDefaultView,
} from "@/cesiumTools/effectController.js";

/* 响应式数据 */
const data = reactive({
  isDesign: false, //是否处于规划模式

  subLineData: [], //地铁线路数据
  startStation: [], //起始站点
  endStation: [], //终点站点
  options: [], //渲染下拉列表的数据

  routeInfo: {}, //路径规划面板数据
});
let viewer;
let pathInfo = {}; // 路径规划完成的数据

// 路径规划的实体
const cacheData = {
  lineEnts: [],
  stationEnts: [],
  billboards: [],
};

onMounted(async () => {
  viewer = lineData.Viewer;
  data.subLineData = await lineData.allData;
  if (data.subLineData.length) {
    data.options = data.subLineData.map((item) => {
      const { name, stationsList } = item;
      // 站点名称
      const children = stationsList.map((station) => {
        return {
          label: station.name,
          value: station.name,
        };
      });
      return {
        // 地铁线路名称
        label: name,
        value: name,
        children, // 站点名称
      };
    });
  }
});

/* 规划路径 */
const enterDesign = async () => {
  if (!Object.keys(pathInfo).length) {
    // 这里判断的是数组的长度有没有,而不是数组存不存在!!!
    if (data.startStation.length && data.endStation.length) {
      // 执行规划
      // 如果存在的话，根据经纬度从后端调用接口数据,获得两站点之间的信息，填充pathInfo
      const data = await getLineData();
      pathInfo = data;
    } else {
      message.warning("请先选择起点和终点站点！");
      return;
    }
  }
  // 如果处于规划模式，就退出
  if (data.isDesign) {
    leaveRouteDesign();
    return;
  }

  // 进入规划模式第一步，隐藏当前地图上所有的元素
  // 我们直接交给图层控制组件完成这一步
  lineData.controlAll(false);
  // 第二步，渲染效果
  mapChange();
  data.isDesign = true;
};

/* 1, 获得规划数据 */
const getLineData = async () => {
  // 1-1. 获得起点和终点的 地铁线路和站点名称
  const startArr = data.startStation;
  const endArr = data.endStation;
  if (startArr.length && endArr.length) {
    // 1-2, 获得起点和终点的 经纬度坐标(字符串)
    let params = {};
    params.origin = getPsoition(startArr[0], startArr[1]);
    params.destination = getPsoition(endArr[0], endArr[1]);
    const { code, data } = await getLinePlan(params);
    if (code == 200) {
      return data;
    } else {
      message.warn("查询不到相关数据");
      return null;
    }
  }
};
// 1-2, 根据线路名称和站点获得经纬度坐标信息
const getPsoition = (lineName, stationName) => {
  // 找到线路名称
  const line = data.subLineData.find((item) => item.name === lineName);
  // 找到站点名称
  const { position } = line.stationsList.find(
    (item) => item.name === stationName
  );
  // 返回经纬度坐标
  return `${position.lng},${position.lat}`;
};

/* 2, 退出 */
const leaveRouteDesign = () => {
  removeActiveEnts();
  lineData.controlAll(true);

  // 定义的变量
  data.isDesign = false; //不处于规划模式
  data.startStation = [];
  data.endStation = [];
  pathInfo = {}; //规划的路径
};

/* 3, 在地图上进行渲染 */
let stations = [], //沿途站点
  paths = [], //地铁线路
  route = {
    stations: [], //途径的地铁线路和站点的总信息
  };
const mapChange = () => {
  // 清除之前的道路规划实体
  removeActiveEnts();
  // 3-1, 获取数据
  getDesignData();
  data.routeInfo = route;
  // 3-2，渲染站点以及路径,不走effectController内部缓存
  renderDesignData();
  // 3-3, 飞
  flyToDefaultView(viewer);
};
// 3-1, 获取数据
const getDesignData = () => {
  // 3-1-1, route 规划路径的距离和沿途站点信息
  const { distance, segments } = pathInfo;
  route.distance = distance; //距离
  segments.forEach((s, sIndex) => {
    const { buslines } = s.bus;
    if (buslines?.length) {
      const target = buslines[0];
      const color = lineColors[sIndex];
      target.color = color; //这里可以直接添加color属性
      route.stations.push(target);
    }

    // 3-1-2, paths地铁线路
    if (buslines) {
      buslines.forEach((b, index) => {
        const line = {
          part: index + 1,
          partStation: [], //途径站
        };
        const {
          type,
          arrival_stop,
          departure_stop,
          name,
          polyline,
          via_stops,
        } = b;
        paths.push({
          name,
          part: index + 1,
          polyline,
        });

        // 3-1-3, stations沿途站点
        if (type === "地铁线路") {
          // 先加入起点站
          let arrival = arrival_stop;
          let departure = departure_stop;
          // 如果是最后一段线路，为终点站，否则为换乘站
          arrival.type = sIndex === segments.length - 1 ? "终点站" : "换乘站";
          // 如果是第一段线路，为起点站，否则为换乘站
          departure.type = sIndex === 0 ? "起点站" : "换乘站";

          line.partStation.push(arrival);
          via_stops.forEach((v) => {
            v.type = "途径站";
            line.partStation.push(v);
          });

          line.partStation.push(departure);
          line.name = name;
        }
        stations.push(line);
      });
    }
  });
};
// 3-2, 渲染站点以及路径,不走effectController内部缓存
const renderDesignData = () => {
  // 3-2-1, 渲染站点
  stations.forEach((station, index) => {
    let color = lineColors[index];
    const { partStation } = station;
    // 添加站点
    partStation.forEach(async (p) => {
      let { location, name, type } = p;
      name = type === "换乘站" ? name + "(换乘)" : name;
      const positionArr = location.split(",").map((item) => +item);
      const position = { lng: positionArr[0], lat: positionArr[1] };
      // 这里不能走缓存，因为name不一样，会污染后续的功能
      const stationEnt = renderStation(viewer, {
        position,
        name,
        color: type === "换乘站" ? "#e9a526" : color,
      });
      const billboard = await renderStationBill(viewer, {
        position,
        name,
        color: type === "换乘站" ? "#e9a526" : color,
        attr: {
          name,
        },
      });
      // 存放在组件中
      cacheData.stationEnts.push(stationEnt);
      cacheData.billboards.push(billboard);
    });
  });
  // 3-2-2, 渲染路径
  paths.forEach((path, index) => {
    const color = lineColors[index];
    const {
      polyline: { polyline },
      name,
    } = path;
    let positionList = polyline.split(";");
    positionList = positionList.map((pos, index) => {
      const [lng, lat] = pos.split(",").map((item) => Number(item));
      return {
        lng: Number(lng),
        lat: Number(lat),
      };
    });
    const lineEnt = renderLines(viewer, {
      positions: positionList,
      name,
      color,
    });
    cacheData.lineEnts.push(lineEnt);
  });
};

// 删除规划实体
const removeActiveEnts = () => {
  removeByCacheData(viewer, cacheData);
  cacheData.billboards = [];
  cacheData.lineEnts = [];
  cacheData.stationEnts = [];
};

/* 卸载 */
onUnmounted(() => {
  leaveRouteDesign();
});
</script>

<style lang="scss" scoped>
.route-design-wrapper {
  position: absolute;
  right: 14%;
  top: 5%;
  .route-design {
    width: 400px;
    height: 170px;
    background-color: rgba(0, 0, 0, 0.6);
    border: 1px solid #885f12;
    margin-right: 10px;

    // 头部
    .header {
      width: 100%;
      height: 40px;
      color: #fff;
      padding-left: 10px;
      background: rgb(255, 255, 255);
      background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 1) 9%,
        rgba(211, 156, 50, 1) 57%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      // 按钮
      .start-btn {
        width: 120px;
        color: #fff;
        margin-left: 140px;
        background-color: transparent;
        border: 1px solid #885f12;
        font-size: 18px;
        padding: 3px;
        pointer-events: all;
        cursor: pointer;
      }

      .start-btn:hover {
        background-color: #5c3f096d;
        border: 1px solid #881212;
      }
    }

    // 中间
    .content {
      width: 100%;
      height: 110px;
      pointer-events: all;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      color: #fff;
    }
  }
}
</style>
