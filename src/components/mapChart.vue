
<template>
  <div style="width:100%;height:100%;">
    <div ref="mapChart" style="width:100%;height:100%;" />
  </div>
</template>
<script>
import 'echarts/map/js/china'
require('echarts/extension/bmap/bmap')
import Markerclusterer from '@/scripts/markerClusterer'
import mapConfig from '@/assets/map-config.json'
import {cities,points} from '@/scripts/dataSource'
export default {
  data: function() {
    return {
      mapdata: [],
      devices: [],
      markers: [],
      mapOpt: {},
      map: null,
      cities: [],
      defaultZoom: 5,
      markerClusterer: null,
      center: [120, 36]
    }
  },
  computed: {},
  mounted: function() {
    this.mapChart = this.$echarts.init(this.$refs.mapChart)
    this.cities = cities
    this.mapdata = points
    this.setMapOpt(cities)
  },
  beforeDestroy() {
    this.mapChart.clear()
    this.mapChart.dispose()
  },
  methods: {
    // 注册地图操作相关事件
    registerEvents() {
      const _this = this
      // resize charts
      window.addEventListener('resize', function() {
        _this.mapChart.resize()
      })
      // 地图拖拽事件,自动框选城市范围
      this.map.addEventListener('dragend', () => {
        const pt = _this.map.getCenter()
        if (_this.map.getZoom() > 7) {
          // eslint-disable-next-line no-undef
          const geoc = new BMap.Geocoder()
          geoc.getLocation(pt, (rs) => {
            const city = rs.addressComponents.city
            const idx = _this.cities.findIndex(item => item.name === city)
            if (idx > -1) {
              // 如果城市在列表中就框选出来
              const allOverlays = this.map.getOverlays()
              allOverlays.map(item => {
                if (item.name === 'polygon') {
                  this.map.removeOverlay(item)
                }
              })
              this.getBoundary(city)
            }
          })
        }
      })
      // 地图缩放事件，切换城市/设备的显示
      this.map.addEventListener('zoomend', () => {
        const zoom = _this.map.getZoom()
        _this.mapChart.setOption({ bmap: { zoom: zoom }})
        this.defaultZoom = zoom
        if (zoom > 7) {
          this.drawDeviceMarkers()
        } else {
          this.markerClusterer.clearMarkers()
          const allOverlays = this.map.getOverlays()
          allOverlays.forEach(item => {
            if (item.name === 'polygon') {
              this.map.removeOverlay(item)
            }
          })
          _this.mapChart.setOption({ series: _this.changeSeries('city', this.cities) })
        }
      })
      // 城市点击事件

      this.mapChart.on('click', (paras) => {
        if (paras.componentSubType === 'effectScatter') {
          this.map.setCenter(paras.name)
          this.activeCity = paras.name
          //   this.map.panTo(new BMap.Point(113.262232, 23.154345))
          this.map.setZoom(9)
          this.mapChart.setOption({ bmap: { zoom: 9 }})
        }
      })
    },
    // 设置echarts bmap 城市的点
    setMapOpt(cities) {
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
        bmap: {
          // 百度地图中心经纬度
          // center: this.center,
          // 百度地图缩放
          zoom: this.defaultZoom,
          // 是否开启拖拽缩放，可以只设置 'scale' 或者 'move'
          roam: true,
          label: { show: true },
          // 百度地图的自定义样式，见 http://developer.baidu.com/map/jsdevelop-11.htm
          mapStyle: { styleJson: mapConfig }
        },
        series: [{
          // 文字和标志
          type: 'effectScatter',
          coordinateSystem: 'bmap',
          data: cities,
          symbolSize: function() {
            return 15
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke'
          },
          encode: { value: 2 },
          hoverAnimation: true,
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              return params.data.name + '<br/>' + params.data.value[2] + '台'
            }
          },
          label: {
            normal: {
              show: true,
              position: 'right',
              formatter: '{b}（{@[2]}台）',
              color: '#B44B68'
            },
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: '#B44B68',
              // shadowBlur: 10,
              // shadowColor: '#309FFB33',
              borderColor: '#B44B68'
            }
          }
        }]
      }
      this.mapChart.setOption(this.mapOpt, true)
      // 获取百度地图实例，使用百度地图自带的控件
      this.map = this.mapChart.getModel().getComponent('bmap').getBMap()
      // eslint-disable-next-line no-undef
      const panel = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL })
      this.map.addControl(panel)
      this.map.setMinZoom(4)
      this.setMarkers()
      this.registerEvents()
      if (this.activeCity) {
        this.map.setCenter(this.activeCity)
        this.map.setZoom(8)
        this.mapChart.setOption({ bmap: { zoom: 8 }})
        this.drawDeviceMarkers()
      }
    },
    // 根据zoom切换城市/设备，tooltip和label也改变
    changeSeries(type, mapdata) {
      // 设备显示聚合点
      if (type === 'device') {
        return [{
          data: []
        }]
      } else {
        // 城市显示echart绘制的点，清除聚合设备点
        return [{
          data: mapdata
        }]
      }
    },
    // 设置地图上的overlay markers
    setMarkers() {
      this.markers = []
      this.points = []
      this.mapdata.forEach((dev) => {
        const valArr = dev.value
        // eslint-disable-next-line no-undef
        const pt = new BMap.Point(valArr[0], valArr[1])
        // eslint-disable-next-line no-undef
        const marker = new BMap.Marker(pt)
        // eslint-disable-next-line no-undef
        const label = new BMap.Label(dev.name)
        label.setStyle({ display: 'none', fontSize: '16px' })
        marker.setLabel(label)
        marker.deviceId = dev.id
        marker.addEventListener('mouseover', () => {
          label.setStyle({ display: 'block' })
        })
        marker.addEventListener('mouseout', () => {
          label.setStyle({ display: 'none' })
        })
        marker.addEventListener('click', (e) => {
          this.$router.push({ name: 'monitor' })
          this.activeDeviceId = e.target.deviceId
        })
        this.markers.push(marker)
      })
      this.markerClusterer = new Markerclusterer(this.map, { markers: [], minClusterSize: 3 })
    },
    // 绘制城市边界范围
    getBoundary(city) {
      const _this = this
      this.activeCity = city
      // eslint-disable-next-line no-undef
      var bdary = new BMap.Boundary()
      bdary.get(city, function(rs) {
        if (rs.boundaries.length === 0) {
          return
        }
        for (const boundary of rs.boundaries) {
          // eslint-disable-next-line no-undef
          var ply = new BMap.Polygon(boundary, { strokeWeight: 3, strokeColor: '#bb9569', fillColor: '' })
          ply.name = 'polygon'
          _this.map.addOverlay(ply)
        }
      })
    },
    // zoom>7时，绘制设备点，画boundary
    drawDeviceMarkers() {
      this.markerClusterer.clearMarkers()
      const city = this.activeCity
      const idx = this.cities.findIndex(item => item.name === city)
      if (idx > -1) {
        // 如果城市在列表中就框选出来
        const allOverlays = this.map.getOverlays()
        allOverlays.forEach(item => {
          if (item.name === 'polygon') {
            this.map.removeOverlay(item)
          }
        })
        this.getBoundary(city)
      }
      this.markerClusterer.addMarkers(this.markers)
      this.mapChart.setOption({ series: this.changeSeries('device') })
    },
  }
}
</script>
<style>
.anchorBL{
  display:none;
}
</style>
