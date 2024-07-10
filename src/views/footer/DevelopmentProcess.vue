<template>
  <commonCard @line-id="handleIdClick">
    <template v-slot:head>
      <div class="title">
        <div class="name">发展历程</div>
        <div class="controls">
          <i
            class="iconfont metro-zanting"
            style="font-size: 18px"
            @click="play"
          ></i>
          <i
            class="iconfont metro-bofang"
            style="font-size: 21px"
            @click="pause"
          ></i>
          <i
            class="iconfont metro-shuaxin"
            style="font-size: 24px"
            @click="replay"
          ></i>
        </div>
      </div>
      <div class="content">
        <a-slider
          style="width: 500px"
          v-if="positions.length !== 0"
          v-model:value="currentTime"
          :marks="marks"
          :step="0.5"
          :min="0"
          :max="max"
          :disabled="true"
        >
        </a-slider>
        <div class="message" v-if="message.length">{{ message }}</div>
      </div>
    </template>
  </commonCard>
</template>

<script setup>
import { onMounted, ref, onUnmounted, watch } from "vue";
import { useLineData } from "@/store";
import { line_history } from "@/store/staticData.js";
import {
  renderAll,
  flyToDefaultView,
} from "@/cesiumTools/effectController.js";
import commonCard from "@/views/footer/model/commonCard.vue";
const lineDataStore = useLineData();

const subLineData = ref(); // 所有地铁路线数据
const subLineNames = ref([]); // 用于全局管理路线显隐
const currentTime = ref(0); //当前时间
const positions = ref([]); //当前地铁坐标
let curPaths = []; //当前播放位置
const message = ref(""); //历史进程
const marks = ref({});
const max = ref(100);
let isAnimate = false; //播放暂停
let viewer;

//隐藏所有地铁路线
onMounted(() => {
  // 获取全局viewer
  viewer = lineDataStore.viewer;
  // 获取全部subLine数据
  subLineData.value = lineDataStore.lineData;

  // 遍历所有地铁路线数据,拿到name,用于全局管理路线显隐
  subLineData.value.forEach((item) => {
    subLineNames.value.push(item.name);
  });
  // 路线隐藏
  lineDataStore.displayLine(subLineNames.value, false);
});

onUnmounted(() => {
  // 删除所有
  viewer.entities.remove(dataEntity);

  // 暂停播放
  pause();

  // 路线显示
  lineDataStore.displayLine(subLineNames.value, true);
});

let dataEntity = {};
const handleIdClick = (id) => {
  //清空实体
  viewer.entities.remove(dataEntity);
  positions.value = [];

  // 飞行到默认点
  flyToDefaultView(viewer);

  //所选地铁路线
  let data = lineDataStore.lineData.filter((item) => item.id == id);

  // 加载轨道的坐标
  data[0].paths.forEach((item) => {
    positions.value.push(...Object.values(item));
  });

  //加载当前线路发展进程
  const target = line_history[id - 1];
  if (target) {
    // 当前时间
    currentTime.value = 0;

    dataEntity = renderAll(viewer, data, false);

    // 渲染时间slider
    max.value = (target.history.length - 1) * 10;
    let res = {};
    target.history.forEach((item, index) => {
      res[index * 10] = {
        style: {
          color: "#fff",
          fontSize: 10,
        },
        label: item.timePoint,
        message: item.message,
      };
    });
    marks.value = res;
    // 找到路线的实体，并给其坐标重新赋值
    const entity = dataEntity.lineEnts[0];
    // 给播放控件赋值，并给路径数据赋值
    entity.polyline.positions = new Cesium.CallbackProperty(
      () => Cesium.Cartesian3.fromDegreesArray(curPaths),
      false
    );
  }
  // 播放
  play();
};

const pause = () => {
  isAnimate = false;
};

const play = () => {
  const animate = () => {
    if (isAnimate) {
      currentTime.value += 0.1;
      const rate = currentTime.value / max.value;
      let index = Math.ceil(rate * positions.value.length);
      // 我们的坐标两个为一组
      if (index % 2 !== 0) {
        index = index + 1;
      }
      // 如果是最后一个坐标
      if (index >= positions.value.length - 1) {
        curPaths = positions.value.slice(0, 2);
        isAnimate = false;
        return;
      }
      curPaths = positions.value.slice(0, index);
      requestAnimationFrame(animate);
    }
  };
  isAnimate = true;
  animate();
};

const replay = () => {
  pause();
  currentTime.value = 0;
  curPaths = positions.value.slice(0, 2);
  play();
};

// 监听当前进度
// 1.找到当前进度在marks当中的下标
// 2.通过下标,找message
watch(currentTime, (val) => {
  let targetIndex = null;
  const markKeys = Object.keys(marks.value).map(Number); // 将键转换为数字数组

  // 遍历 markKeys 数组
  for (let i = 0; i < markKeys.length; i++) {
    // 如果 val 小于或等于当前键，并且要么它是第一个键，要么 val 大于前一个键
    if (val <= markKeys[i] && (i === 0 || val > markKeys[i - 1])) {
      targetIndex = i; // 设置目标索引
      break;
    }
  }
  // 如果找到了目标索引，则设置 message.value
  if (targetIndex) {
    message.value = Object.values(marks.value)[targetIndex].message; // 使用键,从 marks 中获取消息
  } else {
    // 如果没有找到目标索引（例如 val 大于所有标记），则设置默认消息
    message.value = "No mark for this value or it exceeds all marks";
  }
});
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  .name {
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
  }
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    i {
      padding-left: 10px;
      color: white;
      cursor: pointer;
    }
  }
}
.content {
  padding: 20px 30px;
  .message {
    display: flex;
    justify-content: center;
    padding: 20px;
    color: #fff;
    font-size: 18px;
    text-align: center;
  }
}
</style>
