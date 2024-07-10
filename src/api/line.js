/*
 * @Description: 
 * @Author: lijialu lijialu0810@163.com
 * @Date: 2024-06-26 08:47:26
 * @LastEditors: lijialu lijialu0810@163.com
 * @LastEditTime: 2024-06-27 23:18:08
 * @FilePath: \wisdom-subway-system\src\api\line.js
 */
import api from "./request";
import { lineColors } from "@/store/staticData";
import { CoordTransform } from "@/cesiumTools/mapPlugin.js";
import axios from "axios";

export const getLine = async (params) => {
  try {
    const { data, code } = await api.get(`/getLine`, { params });
    if (code === 200) {
      const result = data.map((item, index) => {
        const { xs, ys, stationsList } = item;
        const colorIndex = index % lineColors.length;
        const color = lineColors[colorIndex];
        item.color = color;
        item.checked = true;
        // 整理坐标
        const xpos = xs.split(",").map((item) => parseFloat(item));
        const ypos = ys.split(",").map((item) => parseFloat(item));
        let positions = [];
        if (xpos.length === ypos.length) {
          xpos.forEach((item, index) => {
            const [lng, lat] = CoordTransform.GCJ02ToWGS84(item, ypos[index]);

            positions.push({
              lng,
              lat,
            });
          });
        }
        item.paths = positions;

        if (stationsList.length) {
          item.stationsList = stationsList.map((station) => {
            const { xy_coords, ...rest } = station;
            const [lng, lat] = xy_coords.split(";").map((item) => Number(item));
            const [lngWgs84, latWgs84] = CoordTransform.GCJ02ToWGS84(lng, lat);
            return { position: { lng: lngWgs84, lat: latWgs84 }, ...rest };
          });
        }

        return item;
      });
      return result;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};
export const getLinePlan = (params) => api.get(`/getLinePlan`, { params });
// by name
export const getStationInfo = (params) =>
  api.get(`/getStationInfo`, { params });

// https://restapi.amap.com/v3/weather/weatherInfo?parameters
export const getWeather = async () => {
  const params = {
    key: "5238a5ca7d94bf31d6868f0fad2a0202",
    city: "420100", //wuhan
  };
  let res = await axios.get("https://restapi.amap.com/v3/weather/weatherInfo", {
    params,
  });
  return res.data;
};
