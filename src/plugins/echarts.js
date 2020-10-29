import Vue from 'vue'
import echarts from 'echarts'

import '../assets/echart-theme/light.js'
import '../assets/echart-theme/dark.js'
Vue.use(echarts)
Vue.prototype.$echarts = echarts
