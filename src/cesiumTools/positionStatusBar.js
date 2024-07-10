import * as Cesium from 'cesium'

export default class PositionInfoStatusBar {
    constructor(viewer) {
        this.viewer = viewer;
        this.createDom();
        this.initEvent();
    }

    createDom() {
        this.container = document.createElement("div");//创建div
        this.container.className = "position-info-status-bar";//添加类名

        //获取cesium容器
        let cesiumContaienr = document.getElementById("cesium-viewer")//获取容器
        cesiumContaienr.appendChild(this.container);//添加到容器中


        //经度
        this.divLng = document.createElement("div");
        this.container.appendChild(this.divLng);
        //纬度
        this.divLat = document.createElement("div");
        this.container.appendChild(this.divLat);
        //海拔
        this.divH = document.createElement("div");
        this.container.appendChild(this.divH);

        //方向
        this.divHeading = document.createElement("div");
        //this.container.appendChild(this.divHeading);

        //俯仰角
        this.divPitch = document.createElement("div");
        //this.container.appendChild(this.divPitch);

        //视点高度
        this.divcH = document.createElement("div");
        //this.container.appendChild(this.divcH);
    }

    //鼠标移动事件
    initEvent() {
        this.eventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);//鼠标事件
        this.eventHandler.setInputAction(((e) => {
            let pickPosition = this.viewer.scene.pickPosition(e.startPosition);//鼠标点击位置
            if (!pickPosition) {//鼠标点击位置没有点
                pickPosition = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);//鼠标点击位置没有点，则获取鼠标点击位置的高度
            }
            if (!pickPosition) return;
            this.handleMouseMoveEvent(pickPosition);//鼠标移动事件
        }), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.viewer.scene.camera.moveEnd.addEventListener(this.handleCameraMoveEvent, this);//相机移动事件
    }

    //鼠标移动事件
    handleMouseMoveEvent(position) {
        let degrees = this.catesian3ToDegrees(position);//笛卡尔坐标转经纬度
        this.divLng.innerHTML = "经度：" + degrees.x.toFixed(6);//经度
        this.divLat.innerHTML = "纬度：" + degrees.y.toFixed(6);//纬度
        this.divH.innerHTML = "高度：" + degrees.z.toFixed(6);//海拔
    }

    //相机移动事件
    handleCameraMoveEvent() {
        this.divHeading.innerHTML = "方向：" + Cesium.Math.toDegrees(this.viewer.scene.camera.heading).toFixed(0) + "度";//方向
        this.divPitch.innerHTML = "俯仰角：" + Cesium.Math.toDegrees(this.viewer.scene.camera.pitch).toFixed(0) + "度";//俯仰角

        let degrees = this.catesian3ToDegrees(this.viewer.scene.camera.position);//笛卡尔坐标转经纬度
        this.divcH.innerHTML = "视高：" + degrees.z.toFixed(6) + "米";//视点高度
    }

    //笛卡尔坐标转经纬度
    catesian3ToDegrees(position) {
        const c = Cesium.Cartographic.fromCartesian(position);//笛卡尔坐标转经纬度
        const lon = Cesium.Math.toDegrees(c.longitude);//经度
        const lat = Cesium.Math.toDegrees(c.latitude);//纬度
        const height = c.height;//海拔
        return {
            x: lon,
            y: lat,
            z: height
        }
    }


    //显示
    show() {
        this.container.style.display = "block";
    }

    //隐藏
    hide() {
        this.container.style.display = "none";
    }
}
