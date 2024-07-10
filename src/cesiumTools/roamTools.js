// 引入 cesium
import * as Cesium from "cesium";

// 封装函数 -- 传入地址数组 + 速度
const getSiteTime = (pArr, speed) => {
  // 记录 总时间 + 每一个轨迹点对应的时间
  let timeSum = 0,
    times = [];

  for (let i = 0; i < pArr.length; i++) {
    if (i == 0) {
      times.push(0);
      continue;
    }
    // 计算每两个轨迹点运行的时间
    timeSum += spaceDistance(pArr[i - 1], pArr[i]) / speed;
    times.push(timeSum);
  }

  // 语义化导出
  return { timeSum: timeSum, siteTime: times };
};

/* 计算间隔笛卡尔距离 的函数 */
const spaceDistance = (start, end) => {
  return Cesium.Cartesian3.distance(start, end).toFixed(2);
};

/* 封装 获取轨迹位置 + 时间戳 的函数 */
const getSampleData = (pArr, start, siteTime) => {
  const position = new Cesium.SampledPositionProperty();

  // 计算每一个时间点对应的系统时间
  for (let i = 0; i < pArr.length; i++) {
    const time = Cesium.JulianDate.addSeconds(
      start,
      siteTime[i],
      new Cesium.JulianDate()
    );
    position.addSample(time, pArr[i]);
  }

  // 返回时间
  console.log(position,"函数内部的 position")
  return position;
};

export { getSiteTime, spaceDistance, getSampleData };
