
<template>
  <div id="tool-wrapper" :style="{ right: isManage ? '1%' : '28%' }">
    <div class="tool-item" v-for="item in tools" :title="item.title" @click="handleTool(item)">
      <a-popover v-if="item.title === '图层控制'" placement="leftBottom" trigger="click">
        <template #content>
          <LineController/>
        </template>
        <i :class="['iconfont', item.icon, disabled ? 'disabled-icon' : '']"></i>
      </a-popover>
      <i :class="['iconfont', item.icon]" v-else></i>
    </div>
  </div>
</template>

<script setup>
import toolList from "./toolList";
import {ref, onMounted, watch, nextTick} from "vue";
import {watchLineData, useLineData} from '@/store'
import LineController from "./LineController.vue";
import {renderAll} from '@/cesiumTools/effectController'
import PositionInfoStatusBar from "@/cesiumTools/positionStatusBar";
import {fullScreen, cancelFullscreen} from "./toolFunctions";

const tools = ref(toolList);
const lineDataStore = useLineData()
const disabled = ref(false);
const isManage = ref(false)
const isFullScreen = ref(false);
const MousePositionShowed = ref(false);
let positionStatus
onMounted(async () => {
  const viewer = await watchLineData('setViewer')// 获取viewer
  const lineData = await watchLineData('setData')// 获取数据
  renderAll(viewer, lineData)// 渲染所有线

  // nextTick(()=>{
  //   let lineNames = ['轨道交通1号线', '轨道交通2号线', '轨道交通3号线', '轨道交通4号线', '轨道交通5号线', '轨道交通6号线', '轨道交通7号线', '轨道交通8号线']
  //   lineDataStore.displayLine(lineNames, true)
  // })
  positionStatus = new PositionInfoStatusBar(viewer);// 鼠标位置
  console.log('positionStatus', positionStatus)
})

const handleTool = (data) => {
  //debugger
  const {title} = data;
  switch (title) {
    case "全屏控件":
      controlFullScreen();
      break;
    case "鼠标位置":
      controlMouse();
      break;
    default:
      break;
  }
}
const targetEle = document.getElementById("app");
const controlFullScreen = () => {
  isFullScreen.value && cancelFullscreen();
  !isFullScreen.value && fullScreen(targetEle);
  isFullScreen.value = !isFullScreen.value;
};

// 监听action
lineDataStore.$onAction(({name, store, args, after, onError}) => {
  if (name === 'disableController') {
    after((res) => {
      disabled.value = lineDataStore.isDisable;
    });
  }
})

const controlMouse = () => {
  MousePositionShowed.value ? positionStatus.show() : positionStatus.hide();
  MousePositionShowed.value = !MousePositionShowed.value;
};
</script>
<style scoped>
#tool-wrapper {
  position: absolute;
  right: 28%;
  bottom: 10%;
  display: flex;
  flex-direction: column;
  z-index: 199;
}

.tool-item {
  margin: 4px;
  pointer-events: all;
  cursor: pointer;
}

.tool-item:hover {
  background-color: #d8951a7f;
}

#tool-wrapper i {
  color: #ffd31a;
  border: 1px solid #d8951a;
  padding: 3px;
}

#tool-wrapper span {
  color: #fff;
}

.disabled-icon {
  pointer-events: none;
  cursor: none;
  background-color: rgba(204, 204, 204, 0.306);
}

.disabled-icon:hover {
  cursor: none;
}
</style>
