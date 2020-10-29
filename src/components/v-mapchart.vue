<template>
  <div class="map-chart">
    <v-echarts autoresize :options="mapOpt" style="width:100%;height:100%;" />
    <img ref="dot" hidden src="../../../assets/images/equipment/dot1.png">
    <img ref="dot2" hidden src="../../../assets/images/equipment/dot2.png">
  </div>
</template>
<script>
import 'echarts/map/js/china'
import vEcharts from 'vue-echarts/components/ECharts'
export default {
  components: {
    vEcharts
  },
  props: {
    mapdata: { default: function() {
      return []
    }, type: Array }
  },
  data: function() {
    return {
      mapOpt: {},
      mapObj: null
    }
  },
  computed: {
    theme() {
      return this.$store.state.app.theme
    }
  },
  watch: {
    theme(newVal, oldVal) {
      // 切换地图相关颜色 switch map color
      if (newVal === 'dark') {
        this.mapOpt.geo.itemStyle.normal.areaColor = 'rgba(225,233,240,0.13)'// '#E1E9F022'
        // this.mapOpt.geo.itemStyle.normal.areaColor.image = this.$refs.dot2
        this.mapOpt.geo.itemStyle.normal.borderColor = '#2e8492'
      } else {
        this.mapOpt.geo.itemStyle.normal.areaColor = 'rgba(225,233,240,0.13)'// '#E1E9F022'
        // this.mapOpt.geo.itemStyle.normal.areaColor.image = this.$refs.dot
        this.mapOpt.geo.itemStyle.normal.borderColor = '#b6d1e8'
      }
    }
  },
  mounted: function() {
    this.setMapOpt()
  },
  methods: {
    setMapOpt() {
      this.mapOpt = {
        grid: {
          right: '1%',
          top: '15%',
          bottom: '10%',
          width: '20%'
        },
        tooltip: {
          trigger: 'item' // hover触发器
        },
        geo: {
          map: 'china',
          show: true,
          silent: true,
          roam: true,
          zoom: 1.2,
          center: [107, 36],
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              borderColor: this.theme === 'dark' ? '#2e8492' : '#b6d1e8',
              borderWidth: 3,
              borderType: 'doted',
              // // 纹理填充
              // areaColor:{
              //   image: this.theme === 'dark' ? this.$refs.dot2 : this.$refs.dot, // 支持为 HTMLImageElement, HTMLCanvasElement，不支持路径字符串
              //   repeat: 'repeat' // 是否平铺, 可以是 'repeat-x', 'repeat-y', 'no-repeat'
              // },
              areaColor: 'rgba(225,233,240,0.13)' // 颜色填充
              // shadowColor: 'rgba(255, 255, 255, 1)',
              // shadowOffsetX: -1,
              // shadowOffsetY: 1,
              // shadowBlur: 1
            }
            // emphasis: {
            //   areaColor: '#389BB7',
            //   borderWidth: 0
            // }
          }
        },
        series: [{
        // 文字和标志
          name: 'light',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: this.mapdata,
          symbolSize: 15,
          tooltip: {
            trigger: 'item',
            formatter: function(params, ticket, callback) {
              return '名称：' + params.data.name + '<br/>' + '序列号：' + params.data.code
            }
          },
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: 'rgba(48, 159, 251, 0.2)', // '#309FFB33',
              borderColor: '#309FFB'
            }
          }
        }]
      }
    }
  }
}
</script>
<style scoped lang="scss">
.dark-theme{
  .map-chart{
    background:$dark_bg;
    box-shadow: 1px 1px 5px 0px #0e323b;

  }
}
.map-chart{
  width:100%;
  height:100%;
  background: $bg;
  box-shadow: 1px 1px 5px 0px #dedede;
  border-radius: 10px;
}
</style>