<template>
  <div id="footer">
    <ul>
      <li v-for="item in menus">
        <router-link :to="item.path" :class="[item.isActive?'active-item':'',item.name==='首页'?'home':'']">{{item.name}}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import router from '@/router'
import {watch, ref} from 'vue'

let menus = ref([
      {
        name: '实时轨迹',
        path: '/RealTimeTracking',
        isActive: false
      },
      {
        name: '重点活动',
        path: '/ReinsuranceActivities',
        isActive: false
      },
      {
        name: '首页',
        path: '/',
        isActive: false
      },
      {
        name: '发展历程',
        path: '/DevelopmentProcess',
        isActive: false
      },
      {
        name: '站点管理',
        path: '/SiteManagement',
        isActive: false
      }
])

watch(router.currentRoute, (value) => {
  //console.log('value---->',value)
  menus.value = menus.value.map(n => {
    if (n.path === value.path) {
      //console.log(n);
      n.isActive = true
    } else {
      n.isActive = false
    }
    return n
  })
})

</script>
<style scoped>
#footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 73px;
  background: url('../../assets/uiResources/footer.png');
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  z-index: 9999;
}

#footer ul .active-item {
  color: #ec9b02;
  font-size: 12px;
}

#footer ul {
  width: 28%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  list-style: none;
  margin-top: 24px;
}

#footer ul a {
  color: #fff;
  font-size: 12px;
  text-decoration: none;
}

#footer ul li {
  color: #fff;
  cursor: pointer;
}

#footer ul a:hover {
  color: rgb(97, 89, 89);
}


#footer ul .home {
  display: inline-block;
  transform: translateY(-3px);
}
</style>
