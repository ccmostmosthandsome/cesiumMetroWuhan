<template>
  <div class="activity">
    <vue3-seamless-scroll :list="list" class="scroll" :hover="true" :step="0.4">
      <div class="item" v-for="(item, index) in list" :key="index">
        <span class="message">{{ item.message }}</span>
        <span class="time">{{ item.time }}</span>
      </div>
    </vue3-seamless-scroll>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';

export default defineComponent({
  name: 'App',
  components: {
    Vue3SeamlessScroll,
  },
  setup() {
    // 模拟 公告 
    function generateRandomDate(start, end) {
      const date = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      return date.toISOString().split('T')[0];
    }

    const baseMessage = '13月32日，全线';
    const eventBase = 20; // 起始事件数
    const startDate = new Date(2020, 0, 1); // 起始日期 
    const endDate = new Date(2024, 6, 31); // 结束日期 
    const data = [];
    for (let i = 0; i < 100; i++) {
      const eventCount = eventBase + i; // 逐渐增加事件数
      const message = `${baseMessage}${eventCount}座车站封顶`;
      const time = generateRandomDate(startDate, endDate);
      data.push({
        message,
        time,
      });
    }

    const list = ref(data);
    return { list };
  },
});
</script>

<style>
.activity {
  color: #fff;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: all;
}

.activity .scroll {
  height: 240px;
  margin: 10px;
  overflow: hidden;
}

.item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  padding-right: 60px;
}

.item > span:first-child {
  color: #5dcad0;
}

.item > span:last-child {
  color: #667eb8;
  font-weight: bold;
}
</style>
