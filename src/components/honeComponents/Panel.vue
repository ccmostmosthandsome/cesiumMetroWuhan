<template>
  <div class="panel">
    <div class="head">
      <span>{{ props.title }}</span>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>
<style scoped>
.panel {
  min-width: 33%;
  height:32.3%;
  display: flex;
  flex-direction: column;
}

.panel .head {
  width: 100%;
  height: 45px;
  /* background: url('../../assets/uiResources/panel-header.png'); */
  background-size: cover;
  font-family: '等线Bold';
  letter-spacing: 1px;
}

.panel .head span {
  display: inline-block;
  font-size: 21px;
  background: rgb(255, 255, 255);
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 9%, rgba(211, 156, 50, 1) 57%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  height: 100%;
  line-height: 45px;
  margin-left: 38px;
  margin-top: 2px;
}

.panel .content {
  position: relative;
  width: 100%;
  height: calc(100% - 45px);
  /* background: url('../../assets/uiResources/panel-content.png'); */
  background-size: 100% 100%;
  pointer-events: all;
  background-color: rgba(0, 0, 0, .4);
}

</style>
