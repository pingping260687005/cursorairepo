import * as THREE from 'three'

/**
 * 光照系统 - 管理场景中的各种光源
 */
export class LightingSystem {
  constructor(scene) {
    this.scene = scene
    this.lights = new Map()
    
    // 时间控制
    this.timeOfDay = 12 // 24小时制，12表示正午
    this.dayDuration = 120000 // 一天的持续时间（毫秒）
    this.enableDayNightCycle = false
    
    // 光照参数
    this.ambientIntensity = 0.4
    this.sunIntensity = 1.2
    this.shadowMapSize = 2048
    
    this.init()
  }

  /**
   * 初始化光照系统
   */
  init() {
    this.createAmbientLight()
    this.createSunLight()
    this.createEnvironmentLights()
    this.setupDayNightCycle()
    
    console.log('LightingSystem initialized')
  }

  /**
   * 创建环境光
   */
  createAmbientLight() {
    // 环境光提供整体的基础照明
    const ambientLight = new THREE.AmbientLight(0x404040, this.ambientIntensity)
    ambientLight.name = 'ambientLight'
    
    this.scene.add(ambientLight)
    this.lights.set('ambient', ambientLight)
  }

  /**
   * 创建太阳光（主要的方向光）
   */
  createSunLight() {
    // 方向光模拟太阳光
    const sunLight = new THREE.DirectionalLight(0xffffff, this.sunIntensity)
    
    // 设置太阳光位置
    sunLight.position.set(50, 100, 50)
    sunLight.target.position.set(0, 0, 0)
    sunLight.name = 'sunLight'
    
    // 启用阴影
    sunLight.castShadow = true
    
    // 配置阴影参数
    sunLight.shadow.mapSize.width = this.shadowMapSize
    sunLight.shadow.mapSize.height = this.shadowMapSize
    
    // 设置阴影相机参数
    const shadowCameraSize = 200
    sunLight.shadow.camera.left = -shadowCameraSize
    sunLight.shadow.camera.right = shadowCameraSize
    sunLight.shadow.camera.top = shadowCameraSize
    sunLight.shadow.camera.bottom = -shadowCameraSize
    sunLight.shadow.camera.near = 0.1
    sunLight.shadow.camera.far = 500
    
    // 阴影偏移，减少阴影瑕疵
    sunLight.shadow.bias = -0.0001
    
    this.scene.add(sunLight)
    this.scene.add(sunLight.target)
    this.lights.set('sun', sunLight)
  }

  /**
   * 创建环境装饰光源
   */
  createEnvironmentLights() {
    // 填充光 - 从侧面提供柔和照明
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-50, 30, -50)
    fillLight.name = 'fillLight'
    
    this.scene.add(fillLight)
    this.lights.set('fill', fillLight)
    
    // 背光 - 从背后提供轮廓光
    const rimLight = new THREE.DirectionalLight(0x87CEEB, 0.2)
    rimLight.position.set(0, 20, -100)
    rimLight.name = 'rimLight'
    
    this.scene.add(rimLight)
    this.lights.set('rim', rimLight)
  }

  /**
   * 添加建筑物内部照明
   */
  addBuildingLights(buildings) {
    buildings.forEach((building, index) => {
      // 为每个建筑物添加点光源
      const pointLight = new THREE.PointLight(0xffff99, 0.8, 50)
      pointLight.position.copy(building.position)
      
      // 获取建筑物高度，优先从userData获取，否则使用默认值
      let buildingHeight = 30 // 默认高度
      if (building.userData && building.userData.height) {
        buildingHeight = building.userData.height
      } else {
        // 如果building是Group，尝试找到主要的建筑Mesh
        building.traverse((child) => {
          if (child.isMesh && child.geometry && child.geometry.parameters && child.geometry.parameters.height) {
            buildingHeight = child.geometry.parameters.height
          }
        })
      }
      
      pointLight.position.y += buildingHeight / 2
      pointLight.name = `buildingLight_${index}`
      
      // 随机的光照强度变化，模拟室内活动
      pointLight.userData.baseIntensity = 0.8
      pointLight.userData.flickerSpeed = Math.random() * 0.02 + 0.01
      
      this.scene.add(pointLight)
      this.lights.set(`building_${index}`, pointLight)
    })
  }

  /**
   * 添加街道照明
   */
  addStreetLights(positions) {
    positions.forEach((position, index) => {
      // 街灯光源
      const streetLight = new THREE.SpotLight(0xffffff, 1.0, 30, Math.PI / 6, 0.5)
      streetLight.position.set(position.x, position.y + 8, position.z)
      streetLight.target.position.set(position.x, 0, position.z)
      streetLight.name = `streetLight_${index}`
      
      // 启用阴影
      streetLight.castShadow = true
      streetLight.shadow.mapSize.width = 512
      streetLight.shadow.mapSize.height = 512
      
      this.scene.add(streetLight)
      this.scene.add(streetLight.target)
      this.lights.set(`street_${index}`, streetLight)
      
      // 创建灯杆几何体
      this.createStreetLampPost(position)
    })
  }

  /**
   * 创建路灯柱子
   */
  createStreetLampPost(position) {
    const group = new THREE.Group()
    
    // 灯杆
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 8, 8)
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 4
    pole.castShadow = true
    
    // 灯罩
    const lampGeometry = new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const lampMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff99, 
      transparent: true, 
      opacity: 0.8 
    })
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial)
    lamp.position.y = 8
    
    group.add(pole)
    group.add(lamp)
    group.position.copy(position)
    
    this.scene.add(group)
  }

  /**
   * 设置昼夜循环
   */
  setupDayNightCycle() {
    if (!this.enableDayNightCycle) return
    
    const updateCycle = () => {
      if (this.enableDayNightCycle) {
        this.updateTimeOfDay()
        this.updateSunPosition()
        this.updateLightIntensities()
        this.updateSkyColor()
      }
      
      // 更新建筑物灯光闪烁效果
      this.updateBuildingLights()
      
      requestAnimationFrame(updateCycle)
    }
    
    updateCycle()
  }

  /**
   * 更新时间
   */
  updateTimeOfDay() {
    const now = Date.now()
    this.timeOfDay = ((now % this.dayDuration) / this.dayDuration) * 24
  }

  /**
   * 更新太阳位置
   */
  updateSunPosition() {
    const sunLight = this.lights.get('sun')
    if (!sunLight) return
    
    // 计算太阳的角度（基于时间）
    const sunAngle = (this.timeOfDay / 24) * Math.PI * 2 - Math.PI / 2
    const sunRadius = 200
    
    sunLight.position.x = Math.cos(sunAngle) * sunRadius
    sunLight.position.y = Math.sin(sunAngle) * sunRadius + 50
    sunLight.position.z = 50
    
    // 确保太阳不会到地平线以下
    sunLight.position.y = Math.max(sunLight.position.y, 10)
  }

  /**
   * 更新光照强度
   */
  updateLightIntensities() {
    const sunLight = this.lights.get('sun')
    const ambientLight = this.lights.get('ambient')
    
    if (!sunLight || !ambientLight) return
    
    // 根据时间调整光照强度
    let dayFactor = 1
    
    if (this.timeOfDay < 6 || this.timeOfDay > 18) {
      // 夜晚
      dayFactor = 0.2
    } else if (this.timeOfDay < 8 || this.timeOfDay > 16) {
      // 黄昏/黎明
      dayFactor = 0.6
    } else {
      // 白天
      dayFactor = 1.0
    }
    
    sunLight.intensity = this.sunIntensity * dayFactor
    ambientLight.intensity = this.ambientIntensity * (0.3 + dayFactor * 0.7)
  }

  /**
   * 更新天空颜色
   */
  updateSkyColor() {
    if (!this.scene.background) return
    
    let skyColor = new THREE.Color()
    
    if (this.timeOfDay < 6 || this.timeOfDay > 20) {
      // 夜晚 - 深蓝色
      skyColor.setHex(0x191970)
    } else if (this.timeOfDay < 7 || this.timeOfDay > 19) {
      // 黄昏/黎明 - 橙红色
      skyColor.setHex(0xFF6347)
    } else {
      // 白天 - 天蓝色
      skyColor.setHex(0x87CEEB)
    }
    
    this.scene.background = skyColor
    
    // 更新雾的颜色
    if (this.scene.fog) {
      this.scene.fog.color = skyColor
    }
  }

  /**
   * 更新建筑物灯光闪烁效果
   */
  updateBuildingLights() {
    const time = Date.now() * 0.001
    
    this.lights.forEach((light, key) => {
      if (key.startsWith('building_') && light.userData.flickerSpeed) {
        const flicker = Math.sin(time * light.userData.flickerSpeed) * 0.1
        light.intensity = light.userData.baseIntensity + flicker
      }
    })
  }

  /**
   * 添加特殊效果光源
   */
  addEffectLight(type, position, color = 0xffffff, intensity = 1.0) {
    let light
    
    switch (type) {
      case 'warning':
        // 警告灯光 - 红色闪烁
        light = new THREE.PointLight(0xff0000, intensity, 20)
        light.userData.isFlashing = true
        light.userData.flashSpeed = 2.0
        break
        
      case 'emergency':
        // 应急灯光 - 蓝色
        light = new THREE.PointLight(0x0000ff, intensity, 25)
        break
        
      case 'highlight':
        // 高亮灯光 - 白色聚光
        light = new THREE.SpotLight(color, intensity, 30, Math.PI / 8)
        break
        
      default:
        light = new THREE.PointLight(color, intensity, 15)
    }
    
    light.position.copy(position)
    light.name = `effect_${type}_${Date.now()}`
    
    this.scene.add(light)
    this.lights.set(light.name, light)
    
    return light
  }

  /**
   * 移除光源
   */
  removeLight(lightName) {
    const light = this.lights.get(lightName)
    if (light) {
      this.scene.remove(light)
      if (light.target) {
        this.scene.remove(light.target)
      }
      this.lights.delete(lightName)
      return true
    }
    return false
  }

  /**
   * 设置整体光照强度
   */
  setGlobalIntensity(intensity) {
    this.lights.forEach(light => {
      if (light.userData.baseIntensity !== undefined) {
        light.userData.baseIntensity = intensity
      } else {
        light.intensity = intensity
      }
    })
  }

  /**
   * 启用/禁用阴影
   */
  setShadowsEnabled(enabled) {
    this.lights.forEach(light => {
      if (light.castShadow !== undefined) {
        light.castShadow = enabled
      }
    })
  }

  /**
   * 设置阴影质量
   */
  setShadowQuality(quality) {
    let mapSize
    
    switch (quality) {
      case 'low':
        mapSize = 512
        break
      case 'medium':
        mapSize = 1024
        break
      case 'high':
        mapSize = 2048
        break
      default:
        mapSize = 1024
    }
    
    this.lights.forEach(light => {
      if (light.shadow && light.shadow.mapSize) {
        light.shadow.mapSize.width = mapSize
        light.shadow.mapSize.height = mapSize
      }
    })
  }

  /**
   * 启用/禁用昼夜循环
   */
  setDayNightCycle(enabled) {
    this.enableDayNightCycle = enabled
    
    if (!enabled) {
      // 重置为白天设置
      this.timeOfDay = 12
      this.updateSunPosition()
      this.updateLightIntensities()
      this.updateSkyColor()
    }
  }

  /**
   * 设置时间
   */
  setTimeOfDay(hour) {
    this.timeOfDay = Math.max(0, Math.min(24, hour))
    this.updateSunPosition()
    this.updateLightIntensities()
    this.updateSkyColor()
  }

  /**
   * 获取光照统计信息
   */
  getLightStats() {
    let totalLights = 0
    let shadowCastingLights = 0
    
    this.lights.forEach(light => {
      totalLights++
      if (light.castShadow) {
        shadowCastingLights++
      }
    })
    
    return {
      totalLights,
      shadowCastingLights,
      timeOfDay: this.timeOfDay.toFixed(2),
      dayNightCycle: this.enableDayNightCycle
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.lights.forEach((light, key) => {
      this.scene.remove(light)
      if (light.target) {
        this.scene.remove(light.target)
      }
      
      // 清理阴影贴图
      if (light.shadow && light.shadow.map) {
        light.shadow.map.dispose()
      }
    })
    
    this.lights.clear()
    console.log('LightingSystem disposed')
  }
}