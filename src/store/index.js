import { defineStore } from "pinia";
import { displayByName } from "@/cesiumTools/effectController";

export const useLineData = defineStore("lineData", {
  state: () => {
    return {
      lineData: [],
    };
  },
  getters: {
    // 获取线路显示隐藏信息
    lineDisplay() {
      return this.lineData.map((item) => ({
        //name: item.checked,
        id: item.id,
        name: item.name,
      }));
    },
    // 获取全部信息
    async allData() {
      return this.lineData;
    },
    // 获取全局viewer
    Viewer() {
      return this.viewer;
    },
    // 获取全局tileset
    Tile() {
      return this.tileset;
    },
    // 是否启用全局管理地铁路线
    isDisable() {
      return this.disable;
    },
  },
  actions: {
    setData(data) {
      return new Promise((resolve, reject) => {
        this.lineData = data.length ? data : [];
        console.log("this.lineData", this.lineData);
        resolve(data);
      });
    },
    // 设置全局viewer
    setViewer(viewer) {
      return new Promise((resolve, reject) => {
        this.viewer = viewer;
        resolve(viewer);
      });
    },
    // 设置全局tileset
    setTileset(tileset) {
      return new Promise((resolve, reject) => {
        this.tileset = tileset;
        resolve(tileset);
      });
    },
    // 全局管理路线显隐
    displayLine(lineNames, isShow) {
      if (Array.isArray(lineNames) && this.lineData.length && !this.disable) {
        const stationNames = [];
        // 控制state数据
        this.lineData.forEach((item) => {
          const { stationsList, name } = item;
          if (lineNames.includes(name)) {
            item.checked = isShow;
            stationsList.forEach((station) => {
              stationNames.push(station.name);
            });
          }
        });
        // 控制地图元素
        displayByName(lineNames, stationNames, isShow);
      }
    },
    // 控制全部图层显示隐藏【site】
    controlAll(isShow) {
      const lineNames = [];
      const stationNames = [];
      this.lineData.forEach((item) => {
        const { name, stationsList } = item;
        lineNames.push(name);
        stationsList.forEach((station) => {
          const { name } = station;
          stationNames.push(name);
        });
      });
      // 控制地图元素
      displayByName(lineNames, stationNames, isShow);
    },
  },
});
// 由于lineData的state是异步的，所以需要监听action来获取数据
export const watchLineData = (actionName = "setData") => {
  return new Promise((resolve, reject) => {
    // 监听action
    useLineData().$onAction(({ name, store, args, after, onError }) => {
      if (name === actionName) {
        after((res) => {
          console.log(res);
          if (res) {
            resolve(res);
          }
        });

        onError((e) => {
          reject(e);
        });
      }
    });
  });
};

export const useMeasureData = defineStore("measureData", {
  state: () => {
    return {
      measureData: [],
    };
  },
  getters: {
    // 获取全部信息
    allData() {
      return this.measureData;
    },
  },
  actions: {
    setData(data) {
      return new Promise((resolve, reject) => {
        this.measureData = data.length ? data : [];
        resolve(data);
      });
    },
    // 清除【site】
    clearData() {
      return new Promise((resolve, reject) => {
        const data = this.measureData.map((item) => {
          item.length && item.forEach((n) => (n.measures.length = 0));
          return item;
        });
        this.measureData = data;
        resolve(data);
      });
    },
  },
});
