import { SceneManager } from './core/SceneManager.js'
import { CameraController } from './core/CameraController.js'
import { LightingSystem } from './core/LightingSystem.js'
import { DataManager } from './core/DataManager.js'
import { InteractionSystem } from './core/InteractionSystem.js'
import { UIManager } from './components/UIManager.js'
import { ModelFactory } from './components/ModelFactory.js'

/**
 * 智慧园区3D可视化主应用类
 */
export class SmartParkApp {
  constructor(container) {
    if (typeof container === 'string') {
      this.container = document.querySelector(container)
    } else {
      this.container = container
    }
    
    if (!this.container) {
      throw new Error('Container not found')
    }
    
    // 核心组件
    this.sceneManager = null
    this.cameraController = null
    this.lightingSystem = null
    this.dataManager = null
    this.interactionSystem = null
    this.uiManager = null
    this.modelFactory = null
    
    // 应用状态
    this.isInitialized = false
    this.isRunning = false
    
    // 3D对象引用
    this.parkLayout = null
    this.buildings = []
    this.sensors = []
    this.vehicles = []
    
    // 动画和更新
    this.animationMixers = []
    this.updateCallbacks = []
    
    this.init()
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      console.log('Initializing Smart Park 3D Application...')
      
      // 显示加载屏幕
      this.showLoading()
      
      // 初始化核心组件
      await this.initializeComponents()
      
      // 创建3D场景内容
      await this.createSceneContent()
      
      // 设置组件间的交互
      this.setupComponentInteractions()
      
      // 启动应用
      this.start()
      
      // 隐藏加载屏幕
      this.hideLoading()
      
      this.isInitialized = true
      console.log('Smart Park 3D Application initialized successfully')
      
    } catch (error) {
      console.error('Failed to initialize application:', error)
      this.showError('应用初始化失败: ' + error.message)
    }
  }

  /**
   * 显示加载屏幕
   */
  showLoading() {
    const loadingElement = document.getElementById('loading-screen')
    if (loadingElement) {
      loadingElement.classList.remove('hidden')
    }
  }

  /**
   * 隐藏加载屏幕
   */
  hideLoading() {
    const loadingElement = document.getElementById('loading-screen')
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.classList.add('hidden')
      }, 500)
    }
  }

  /**
   * 更新加载进度
   */
  updateLoadingProgress(progress, message = '') {
    const progressElement = document.getElementById('loading-progress')
    if (progressElement) {
      progressElement.style.width = `${progress}%`
    }
    
    if (message) {
      const loadingContent = document.querySelector('.loading-content p')
      if (loadingContent) {
        loadingContent.textContent = message
      }
    }
  }

  /**
   * 初始化核心组件
   */
  async initializeComponents() {
    // 1. 场景管理器 (20%)
    this.updateLoadingProgress(20, '初始化3D场景...')
    this.sceneManager = new SceneManager(this.container)
    await this.delay(100)
    
    // 2. 相机控制器 (40%)
    this.updateLoadingProgress(40, '设置相机控制...')
    this.cameraController = new CameraController(
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement
    )
    await this.delay(100)
    
    // 3. 光照系统 (50%)
    this.updateLoadingProgress(50, '配置光照系统...')
    this.lightingSystem = new LightingSystem(this.sceneManager.scene)
    await this.delay(100)
    
    // 4. 数据管理器 (60%)
    this.updateLoadingProgress(60, '初始化数据管理...')
    this.dataManager = new DataManager()
    await this.delay(100)
    
    // 5. 模型工厂 (70%)
    this.updateLoadingProgress(70, '准备3D模型...')
    this.modelFactory = new ModelFactory()
    await this.delay(100)
    
    // 6. UI管理器 (80%)
    this.updateLoadingProgress(80, '设置用户界面...')
    this.uiManager = new UIManager()
    await this.delay(100)
    
    // 7. 交互系统 (90%)
    this.updateLoadingProgress(90, '配置交互系统...')
    this.interactionSystem = new InteractionSystem(
      this.sceneManager.camera,
      this.sceneManager.scene,
      this.sceneManager.renderer.domElement
    )
    await this.delay(100)
  }

  /**
   * 创建3D场景内容
   */
  async createSceneContent() {
    this.updateLoadingProgress(95, '构建智慧园区...')
    
    // 创建园区布局
    this.parkLayout = this.modelFactory.createParkLayout()
    this.sceneManager.addObject(this.parkLayout)
    
    // 收集建筑物引用
    const buildingsGroup = this.parkLayout.children.find(child => child.name === 'buildings')
    if (buildingsGroup) {
      this.buildings = buildingsGroup.children
      
      // 为建筑物添加照明
      this.lightingSystem.addBuildingLights(this.buildings)
    }
    
    // 收集传感器引用
    const sensorsGroup = this.parkLayout.children.find(child => child.name === 'sensors')
    if (sensorsGroup) {
      this.sensors = sensorsGroup.children
    }
    
    // 创建移动车辆
    const vehiclesGroup = this.modelFactory.createMovingVehicles()
    this.sceneManager.addObject(vehiclesGroup)
    this.vehicles = vehiclesGroup.children
    
    // 添加街道照明
    const streetLightPositions = [
      { x: -50, y: 0, z: -50 },
      { x: 50, y: 0, z: -50 },
      { x: -50, y: 0, z: 50 },
      { x: 50, y: 0, z: 50 },
      { x: 0, y: 0, z: -100 },
      { x: 0, y: 0, z: 100 }
    ]
    this.lightingSystem.addStreetLights(streetLightPositions)
    
    await this.delay(100)
    this.updateLoadingProgress(100, '完成!')
  }

  /**
   * 设置组件间的交互
   */
  setupComponentInteractions() {
    // UI管理器回调
    this.uiManager.setCallback('viewChange', (preset) => {
      this.cameraController.setPresetView(preset)
    })
    
    this.uiManager.setCallback('displayToggle', ({ type, visible }) => {
      this.toggleObjectDisplay(type, visible)
    })
    
    this.uiManager.setCallback('filterChange', ({ type, value }) => {
      this.applyFilter(type, value)
    })
    
    this.uiManager.setCallback('resetView', () => {
      this.cameraController.setPresetView('isometric')
    })
    
    // 交互系统回调
    this.interactionSystem.setCallback('objectSelected', (object) => {
      const objectInfo = this.getObjectDetailedInfo(object)
      this.uiManager.showObjectInfo(objectInfo)
    })
    
    this.interactionSystem.setCallback('selectionCleared', () => {
      this.uiManager.hideObjectInfo()
    })
    
    this.interactionSystem.setCallback('animateCamera', ({ position, target }) => {
      this.cameraController.animateToPosition(position, target)
    })
    
    this.interactionSystem.setCallback('objectFocus', (object) => {
      this.uiManager.showNotification('聚焦到: ' + (object.name || '对象'))
    })
    
    // 数据管理器回调
    this.dataManager.setCallback('dataUpdate', () => {
      this.updateSceneWithData()
    })
    
    this.dataManager.setCallback('newAlert', (alert) => {
      this.uiManager.showNotification(
        `新告警: ${alert.message}`,
        alert.severity === 'high' ? 'error' : 'warning'
      )
    })
    
    // 场景管理器事件监听
    document.addEventListener('sceneManager:render', () => {
      this.update()
    })
    
    document.addEventListener('sceneManager:fpsUpdate', (event) => {
      const stats = this.sceneManager.getSceneStats()
      this.uiManager.updateObjectCount(stats.objects)
    })
  }

  /**
   * 启动应用
   */
  start() {
    if (this.isRunning) return
    
    // 开始渲染循环
    this.sceneManager.startRendering()
    
    // 更新UI统计信息
    this.updateUIStats()
    
    this.isRunning = true
    console.log('Smart Park 3D Application started')
  }

  /**
   * 停止应用
   */
  stop() {
    if (!this.isRunning) return
    
    // 停止渲染循环
    this.sceneManager.stopRendering()
    
    this.isRunning = false
    console.log('Smart Park 3D Application stopped')
  }

  /**
   * 应用更新循环
   */
  update() {
    if (!this.isRunning) return
    
    // 更新相机控制器
    this.cameraController.update()
    
    // 更新车辆动画
    this.updateVehicleAnimations()
    
    // 执行自定义更新回调
    this.updateCallbacks.forEach(callback => {
      if (typeof callback === 'function') {
        callback()
      }
    })
  }

  /**
   * 更新车辆动画
   */
  updateVehicleAnimations() {
    this.vehicles.forEach(vehicle => {
      if (vehicle.userData.path && vehicle.userData.pathIndex !== undefined) {
        const path = vehicle.userData.path
        const speed = vehicle.userData.speed || 0.2
        
        // 更新路径索引
        vehicle.userData.pathIndex += speed
        
        if (vehicle.userData.pathIndex >= path.length - 1) {
          vehicle.userData.pathIndex = 0 // 循环路径
        }
        
        // 插值计算位置
        const currentIndex = Math.floor(vehicle.userData.pathIndex)
        const nextIndex = (currentIndex + 1) % path.length
        const t = vehicle.userData.pathIndex - currentIndex
        
        const currentPos = path[currentIndex]
        const nextPos = path[nextIndex]
        
        // 线性插值位置
        vehicle.position.x = currentPos.x + (nextPos.x - currentPos.x) * t
        vehicle.position.y = currentPos.y + (nextPos.y - currentPos.y) * t
        vehicle.position.z = currentPos.z + (nextPos.z - currentPos.z) * t
        
        // 计算朝向
        const direction = {
          x: nextPos.x - currentPos.x,
          z: nextPos.z - currentPos.z
        }
        
        if (Math.abs(direction.x) > 0.01 || Math.abs(direction.z) > 0.01) {
          vehicle.rotation.y = Math.atan2(direction.x, direction.z)
        }
        
        // 更新车轮旋转
        if (vehicle.userData.wheels) {
          const wheelRotation = vehicle.userData.pathIndex * 0.1
          vehicle.userData.wheels.forEach(wheel => {
            wheel.rotation.x = wheelRotation
          })
        }
      }
    })
  }

  /**
   * 根据数据更新场景
   */
  updateSceneWithData() {
    // 更新传感器状态
    this.updateSensorStatus()
    
    // 更新建筑物状态
    this.updateBuildingStatus()
    
    // 更新UI统计信息
    this.updateUIStats()
  }

  /**
   * 更新传感器状态
   */
  updateSensorStatus() {
    const sensorData = this.dataManager.getData('sensors') || []
    
    this.sensors.forEach((sensorObject, index) => {
      const data = sensorData[index]
      if (!data) return
      
      // 更新传感器材质颜色
      sensorObject.traverse(child => {
        if (child.isMesh && child.geometry.type === 'SphereGeometry') {
          const material = this.modelFactory.getMaterial(`sensor-${data.status}`)
          if (material) {
            child.material = material
          }
        }
      })
      
      // 更新用户数据
      sensorObject.userData = { ...sensorObject.userData, ...data }
    })
  }

  /**
   * 更新建筑物状态
   */
  updateBuildingStatus() {
    const buildingData = this.dataManager.getData('buildings') || []
    
    this.buildings.forEach((buildingObject, index) => {
      const data = buildingData[index]
      if (!data) return
      
      // 更新用户数据
      buildingObject.userData = { ...buildingObject.userData, ...data }
      
      // 根据能耗调整建筑物颜色
      const energyRatio = data.energy.current / 1000 // 假设最大1000kW
      const intensity = Math.min(energyRatio, 1)
      
      buildingObject.traverse(child => {
        if (child.isMesh && child.geometry.type === 'BoxGeometry') {
          const hue = (1 - intensity) * 0.3 // 从绿色到红色
          child.material = child.material.clone()
          child.material.color.setHSL(hue, 0.7, 0.5)
        }
      })
    })
  }

  /**
   * 更新UI统计信息
   */
  updateUIStats() {
    const stats = this.dataManager.getStats()
    this.uiManager.updateStats(stats)
  }

  /**
   * 获取对象详细信息
   */
  getObjectDetailedInfo(object) {
    const baseInfo = this.interactionSystem.getSelectedObjectInfo()
    
    // 从数据管理器获取实时数据
    let additionalData = {}
    
    if (baseInfo.type === 'building') {
      const buildingData = this.dataManager.getData('buildings') || []
      const buildingInfo = buildingData.find(b => b.id === object.name)
      if (buildingInfo) {
        additionalData = buildingInfo
      }
    } else if (baseInfo.type === 'sensor') {
      const sensorData = this.dataManager.getData('sensors') || []
      const sensorInfo = sensorData.find(s => s.id === object.name)
      if (sensorInfo) {
        additionalData = sensorInfo
      }
    }
    
    return { ...baseInfo, ...additionalData }
  }

  /**
   * 切换对象显示
   */
  toggleObjectDisplay(type, visible) {
    let targetGroup = null
    
    switch (type) {
      case 'buildings':
        targetGroup = this.parkLayout.children.find(child => child.name === 'buildings')
        break
      case 'sensors':
        targetGroup = this.parkLayout.children.find(child => child.name === 'sensors')
        break
      case 'vehicles':
        const vehicleGroup = this.sceneManager.scene.children.find(child => child.name === 'vehicles')
        if (vehicleGroup) targetGroup = vehicleGroup
        break
      case 'vegetation':
        targetGroup = this.parkLayout.children.find(child => child.name === 'vegetation')
        break
    }
    
    if (targetGroup) {
      targetGroup.visible = visible
    }
  }

  /**
   * 应用筛选器
   */
  applyFilter(type, value) {
    if (type === 'sensors') {
      this.sensors.forEach(sensor => {
        const userData = sensor.userData
        if (value === 'all' || userData.status === value) {
          sensor.visible = true
        } else {
          sensor.visible = false
        }
      })
    } else if (type === 'buildings') {
      this.buildings.forEach(building => {
        const userData = building.userData
        if (value === 'all' || userData.status === value) {
          building.visible = true
        } else {
          building.visible = false
        }
      })
    }
  }

  /**
   * 添加更新回调
   */
  addUpdateCallback(callback) {
    if (typeof callback === 'function') {
      this.updateCallbacks.push(callback)
    }
  }

  /**
   * 移除更新回调
   */
  removeUpdateCallback(callback) {
    const index = this.updateCallbacks.indexOf(callback)
    if (index > -1) {
      this.updateCallbacks.splice(index, 1)
    }
  }

  /**
   * 设置渲染质量
   */
  setRenderQuality(quality) {
    this.sceneManager.setRenderQuality(quality)
    this.lightingSystem.setShadowQuality(quality)
  }

  /**
   * 启用/禁用昼夜循环
   */
  setDayNightCycle(enabled) {
    this.lightingSystem.setDayNightCycle(enabled)
  }

  /**
   * 导出场景数据
   */
  exportSceneData() {
    return {
      camera: {
        position: this.sceneManager.camera.position,
        target: this.cameraController.target
      },
      data: this.dataManager.exportData(),
      timestamp: Date.now()
    }
  }

  /**
   * 导入场景数据
   */
  importSceneData(sceneData) {
    if (sceneData.camera) {
      this.cameraController.animateToPosition(
        sceneData.camera.position,
        sceneData.camera.target
      )
    }
    
    if (sceneData.data) {
      this.dataManager.importData(sceneData.data)
    }
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    console.error(message)
    
    if (this.uiManager) {
      this.uiManager.showNotification(message, 'error', 5000)
    }
  }

  /**
   * 延迟辅助函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 清理应用资源
   */
  dispose() {
    console.log('Disposing Smart Park 3D Application...')
    
    // 停止应用
    this.stop()
    
    // 清理组件
    if (this.interactionSystem) {
      this.interactionSystem.dispose()
    }
    
    if (this.uiManager) {
      this.uiManager.dispose()
    }
    
    if (this.dataManager) {
      this.dataManager.dispose()
    }
    
    if (this.lightingSystem) {
      this.lightingSystem.dispose()
    }
    
    if (this.cameraController) {
      this.cameraController.dispose()
    }
    
    if (this.modelFactory) {
      this.modelFactory.dispose()
    }
    
    if (this.sceneManager) {
      this.sceneManager.dispose()
    }
    
    // 清理引用
    this.buildings = []
    this.sensors = []
    this.vehicles = []
    this.updateCallbacks = []
    
    console.log('Smart Park 3D Application disposed')
  }
}