<template>
  <div id="subLine-controller">
    <div>
      <div class="item">
        <input id="label" type="checkbox" :checked="showAll" @change="controlAll"/>
        <label for="label" class="labelChaeckAll">全选</label>
      </div>
    </div>
    <div class="item-wrapper">
      <div class="item" v-for="item in subLineData" @click.stop="chooseLine(item)">
        <div class="box" :style="{
                    borderColor: item.color,
                    backgroundColor: item.checked ? item.color : 'transparent',
                }"></div>
        <span :style="{ color: '#34c5cf' }">{{ item.name.slice(-3) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref,computed} from 'vue'
import {useLineData} from '@/store'
import {binkLineByName, flyToLine} from '@/cesiumTools/effectController'

const subLineData = ref([])
//const showAll = ref(true)
const lineDataStore = useLineData()// 获取数据
let viewer = lineDataStore.Viewer// 获取viewer

// 全选，控制所有站点，站线
const controlAll = (e) => {
  const checked = e.target.checked// 获取全选状态
  const lineNames = subLineData.value.map(item => item.name)// 获取所有站线名称
  lineDataStore.displayLine(lineNames, checked)// 控制所有站线
}

// 单独控制站线
const chooseLine = (item) => {
  const names = [item.name]
  lineDataStore.displayLine(names, !item.checked)// 控制该站线
  if (item.checked){
    flyToLine(viewer,item.name) // 点击后，跳转到该站线
    binkLineByName(item.name) // 闪烁
  }
}

onMounted(async () => {
  subLineData.value = await lineDataStore.allData// 获取所有数据
})

//全选和反选
const showAll = computed({
  get: () => {
    return subLineData.value.every((item) => item.checked);
  },
  set: (val) => {
    subLineData.value.forEach((item) => {item.checked = val});
  },
});
</script>
<style scoped>
.mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-color: rgba(204, 204, 204, 0.165);
  z-index: 999;
}

#subLine-controller {
  position: relative;
  width: 3.885vw;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #664a16;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  padding-bottom: 0;
}

#label{
  cursor: pointer;
}
.labelChaeckAll{
  cursor: pointer;
  display: inline-block;
  flex-grow: 1;
  text-align: right;
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
  width: 3.385vw;
  height: 1.042vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.156vw;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid #885f12;
  color: #fff;
  font-size: 0.521vw;
  pointer-events: all;
  cursor: pointer;
  margin-bottom: 10px;
}

.item:hover {
  border: 1px solid #d8961a;
}

.item > span {
  line-height: 0.469vw;
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
</style>
