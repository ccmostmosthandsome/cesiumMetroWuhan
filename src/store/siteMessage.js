import { ref } from "vue";
import { defineStore } from "pinia";

const useSiteStore = defineStore("site", () => {
  /* 1, 查询模式 */
  // 数据
  const stationMangeItems = ref([
    {
      title: "站点拥挤度",
      icon: "metro-lineRoute",
      id: "lineCrowd",
      active: false,
    },
    {
      title: "周边查询",
      icon: "metro-zhoubian",
      id: "stationAround",
      active: false,
    },
    {
      title: "路径规划",
      icon: "metro-lujingguihua",
      id: "pathDesign",
      active: false,
    },
    {
      title: "站控措施",
      icon: "metro-ditie",
      id: "stationControl",
      active: false,
    },
  ]);
  /* 2, 站控措施 */
  const station_solutions = ref([
    {
      title: "重保",
      iconName: "metro-yibao",
    },
    {
      title: "安检",
      iconName: "metro--control",
    },
    {
      title: "封站",
      iconName: "metro-jinzhi",
    },
    {
      title: "分批放行乘客",
      iconName: "metro-yonghu",
    },
    {
      title: "设立导流围栏",
      iconName: "metro-fence-full",
    },
    {
      title: "关闭部分进站闸机",
      iconName: "metro-zhaji",
    },
    {
      title: "减缓售票速度",
      iconName: "metro-shoupiao",
    },
    {
      title: "改变电梯运行方向",
      iconName: "metro-dianti",
    },
    {
      title: "引导乘客分流",
      iconName: "metro-code-branch",
    },
  ]);
  return {
    // 1, 查询模式
    stationMangeItems,
    // 2, 站控措施
    station_solutions,
  };
});

export default useSiteStore;
