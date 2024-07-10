import "./style.scss";

import {createApp} from "vue";
import {createPinia} from "pinia";
import App from "./App.vue";
import router from "./router";

// 大屏自适应
import VScaleScreen from "v-scale-screen";
import vue3SeamlessScroll from "vue3-seamless-scroll";
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import VueVideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

// ant组件库
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";


const app = createApp(App);

app.use(Antd)
    .use(VueVideoPlayer)
    .use(createPinia())
    .use(router)
    .use(VScaleScreen)
    .use(vue3SeamlessScroll)
    .use(VueViewer)
    .mount('#app')
export default app;
