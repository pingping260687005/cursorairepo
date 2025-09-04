/**
 * 数据管理器 - 处理实时数据的获取、处理和分发
 */
export class DataManager {
  constructor() {
    // 数据缓存
    this.cache = new Map()
    this.realtimeData = new Map()
    
    // WebSocket 连接
    this.websocket = null
    this.reconnectInterval = 5000
    this.maxReconnectAttempts = 10
    this.reconnectAttempts = 0
    
    // 数据更新间隔
    this.updateInterval = 1000
    this.updateTimer = null
    
    // 事件回调
    this.callbacks = new Map()
    
    // 模拟数据生成器
    this.simulationEnabled = true
    this.simulationTimer = null
    
    this.init()
  }

  /**
   * 初始化数据管理器
   */
  init() {
    this.initializeCache()
    
    if (this.simulationEnabled) {
      this.startSimulation()
    } else {
      this.connectWebSocket()
    }
    
    console.log('DataManager initialized')
  }

  /**
   * 初始化数据缓存
   */
  initializeCache() {
    // 园区基础信息
    this.cache.set('parkInfo', {
      name: '智慧科技园区',
      area: 400 * 400, // 平方米
      buildings: 8,
      sensors: 25,
      vehicles: 5,
      lastUpdate: Date.now()
    })
    
    // 建筑物数据
    this.cache.set('buildings', this.generateBuildingData())
    
    // 传感器数据
    this.cache.set('sensors', this.generateSensorData())
    
    // 车辆数据
    this.cache.set('vehicles', this.generateVehicleData())
    
    // 能耗数据
    this.cache.set('energy', this.generateEnergyData())
    
    // 告警数据
    this.cache.set('alerts', this.generateAlertData())
  }

  /**
   * 生成建筑物数据
   */
  generateBuildingData() {
    const buildings = []
    const buildingTypes = ['office', 'research', 'datacenter', 'warehouse', 'utility', 'mixed', 'innovation']
    
    for (let i = 0; i < 8; i++) {
      buildings.push({
        id: `building_${i}`,
        name: `建筑物 ${i + 1}`,
        type: buildingTypes[i] || 'office',
        position: this.getBuildingPosition(i),
        floors: Math.floor(Math.random() * 10) + 3,
        area: Math.floor(Math.random() * 2000) + 500,
        occupancy: Math.random() * 100,
        energy: {
          current: Math.random() * 1000,
          daily: Math.random() * 5000,
          monthly: Math.random() * 150000
        },
        status: Math.random() > 0.8 ? 'maintenance' : 'normal',
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        airQuality: Math.random() * 100,
        lastUpdate: Date.now()
      })
    }
    
    return buildings
  }

  /**
   * 获取建筑物位置
   */
  getBuildingPosition(index) {
    const positions = [
      { x: -80, y: 0, z: -80 },
      { x: -80, y: 0, z: 80 },
      { x: 80, y: 0, z: -80 },
      { x: 80, y: 0, z: 80 },
      { x: -40, y: 0, z: 0 },
      { x: 40, y: 0, z: 0 },
      { x: 0, y: 0, z: -40 },
      { x: 0, y: 0, z: 40 }
    ]
    
    return positions[index] || { x: 0, y: 0, z: 0 }
  }

  /**
   * 生成传感器数据
   */
  generateSensorData() {
    const sensors = []
    const sensorTypes = ['temperature', 'humidity', 'air_quality', 'motion', 'sound']
    const statusOptions = ['normal', 'warning', 'error']
    
    for (let i = 0; i < 25; i++) {
      const type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)]
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
      
      sensors.push({
        id: `sensor_${i}`,
        type,
        name: `${this.getSensorTypeName(type)} ${i + 1}`,
        position: {
          x: (Math.random() - 0.5) * 300,
          y: 0,
          z: (Math.random() - 0.5) * 300
        },
        status,
        value: this.generateSensorValue(type),
        unit: this.getSensorUnit(type),
        threshold: this.getSensorThreshold(type),
        history: this.generateSensorHistory(type),
        lastUpdate: Date.now() - Math.random() * 300000 // 最近5分钟内
      })
    }
    
    return sensors
  }

  /**
   * 生成传感器值
   */
  generateSensorValue(type) {
    switch (type) {
      case 'temperature':
        return 15 + Math.random() * 20 // 15-35°C
      case 'humidity':
        return 30 + Math.random() * 40 // 30-70%
      case 'air_quality':
        return Math.random() * 500 // 0-500 AQI
      case 'motion':
        return Math.random() > 0.7 ? 1 : 0 // 0 或 1
      case 'sound':
        return 30 + Math.random() * 50 // 30-80 dB
      default:
        return Math.random() * 100
    }
  }

  /**
   * 获取传感器单位
   */
  getSensorUnit(type) {
    const units = {
      'temperature': '°C',
      'humidity': '%',
      'air_quality': 'AQI',
      'motion': '',
      'sound': 'dB'
    }
    return units[type] || ''
  }

  /**
   * 获取传感器阈值
   */
  getSensorThreshold(type) {
    const thresholds = {
      'temperature': { min: 18, max: 28 },
      'humidity': { min: 40, max: 60 },
      'air_quality': { min: 0, max: 150 },
      'motion': { min: 0, max: 1 },
      'sound': { min: 0, max: 70 }
    }
    return thresholds[type] || { min: 0, max: 100 }
  }

  /**
   * 获取传感器类型名称
   */
  getSensorTypeName(type) {
    const names = {
      'temperature': '温度传感器',
      'humidity': '湿度传感器',
      'air_quality': '空气质量传感器',
      'motion': '运动传感器',
      'sound': '声音传感器'
    }
    return names[type] || '传感器'
  }

  /**
   * 生成传感器历史数据
   */
  generateSensorHistory(type) {
    const history = []
    const now = Date.now()
    const interval = 5 * 60 * 1000 // 5分钟间隔
    
    for (let i = 0; i < 24; i++) { // 最近2小时的数据
      const timestamp = now - i * interval
      history.unshift({
        timestamp,
        value: this.generateSensorValue(type)
      })
    }
    
    return history
  }

  /**
   * 生成车辆数据
   */
  generateVehicleData() {
    const vehicles = []
    const vehicleTypes = ['car', 'truck', 'bus', 'emergency']
    
    for (let i = 0; i < 5; i++) {
      vehicles.push({
        id: `vehicle_${i}`,
        type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        name: `车辆 ${i + 1}`,
        position: {
          x: (Math.random() - 0.5) * 100,
          y: 0.1,
          z: (Math.random() - 0.5) * 100
        },
        speed: Math.random() * 60, // km/h
        direction: Math.random() * 360, // 度
        status: Math.random() > 0.9 ? 'maintenance' : 'active',
        fuel: Math.random() * 100, // %
        lastUpdate: Date.now()
      })
    }
    
    return vehicles
  }

  /**
   * 生成能耗数据
   */
  generateEnergyData() {
    return {
      total: {
        current: Math.random() * 5000, // kW
        daily: Math.random() * 50000, // kWh
        monthly: Math.random() * 1500000 // kWh
      },
      byBuilding: this.cache.get('buildings')?.map(building => ({
        buildingId: building.id,
        current: building.energy.current,
        daily: building.energy.daily,
        efficiency: Math.random() * 100
      })) || [],
      renewable: {
        solar: Math.random() * 1000,
        wind: Math.random() * 500,
        percentage: Math.random() * 30
      },
      lastUpdate: Date.now()
    }
  }

  /**
   * 生成告警数据
   */
  generateAlertData() {
    const alerts = []
    const alertTypes = ['temperature', 'humidity', 'energy', 'security', 'maintenance']
    const severities = ['low', 'medium', 'high', 'critical']
    
    // 随机生成0-5个告警
    const alertCount = Math.floor(Math.random() * 6)
    
    for (let i = 0; i < alertCount; i++) {
      alerts.push({
        id: `alert_${Date.now()}_${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: this.generateAlertMessage(),
        source: `sensor_${Math.floor(Math.random() * 25)}`,
        timestamp: Date.now() - Math.random() * 3600000, // 最近1小时内
        acknowledged: Math.random() > 0.7,
        resolved: Math.random() > 0.8
      })
    }
    
    return alerts
  }

  /**
   * 生成告警消息
   */
  generateAlertMessage() {
    const messages = [
      '温度超出正常范围',
      '湿度异常',
      '能耗超标',
      '检测到异常活动',
      '设备需要维护',
      '空气质量下降',
      '噪声超标',
      '传感器离线'
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  /**
   * 开始数据模拟
   */
  startSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer)
    }
    
    this.simulationTimer = setInterval(() => {
      this.updateSimulationData()
    }, this.updateInterval)
    
    console.log('Data simulation started')
  }

  /**
   * 停止数据模拟
   */
  stopSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer)
      this.simulationTimer = null
    }
    
    console.log('Data simulation stopped')
  }

  /**
   * 更新模拟数据
   */
  updateSimulationData() {
    // 更新传感器数据
    this.updateSensorData()
    
    // 更新建筑物数据
    this.updateBuildingData()
    
    // 更新车辆数据
    this.updateVehicleData()
    
    // 更新能耗数据
    this.updateEnergyData()
    
    // 随机生成新告警
    if (Math.random() < 0.1) { // 10%概率
      this.generateNewAlert()
    }
    
    // 触发数据更新事件
    this.triggerCallback('dataUpdate', {
      timestamp: Date.now(),
      type: 'realtime'
    })
  }

  /**
   * 更新传感器数据
   */
  updateSensorData() {
    const sensors = this.cache.get('sensors')
    if (!sensors) return
    
    sensors.forEach(sensor => {
      // 模拟数据变化
      const change = (Math.random() - 0.5) * 0.2
      sensor.value += sensor.value * change
      
      // 确保值在合理范围内
      sensor.value = Math.max(0, sensor.value)
      
      // 更新状态
      const threshold = sensor.threshold
      if (sensor.value < threshold.min || sensor.value > threshold.max) {
        sensor.status = 'warning'
      } else {
        sensor.status = Math.random() > 0.95 ? 'error' : 'normal'
      }
      
      // 更新历史数据
      sensor.history.push({
        timestamp: Date.now(),
        value: sensor.value
      })
      
      // 保持历史数据长度
      if (sensor.history.length > 100) {
        sensor.history.shift()
      }
      
      sensor.lastUpdate = Date.now()
    })
  }

  /**
   * 更新建筑物数据
   */
  updateBuildingData() {
    const buildings = this.cache.get('buildings')
    if (!buildings) return
    
    buildings.forEach(building => {
      // 更新占用率
      building.occupancy += (Math.random() - 0.5) * 5
      building.occupancy = Math.max(0, Math.min(100, building.occupancy))
      
      // 更新温度
      building.temperature += (Math.random() - 0.5) * 0.5
      building.temperature = Math.max(15, Math.min(35, building.temperature))
      
      // 更新湿度
      building.humidity += (Math.random() - 0.5) * 2
      building.humidity = Math.max(20, Math.min(80, building.humidity))
      
      // 更新能耗
      building.energy.current += (Math.random() - 0.5) * 50
      building.energy.current = Math.max(0, building.energy.current)
      
      building.lastUpdate = Date.now()
    })
  }

  /**
   * 更新车辆数据
   */
  updateVehicleData() {
    const vehicles = this.cache.get('vehicles')
    if (!vehicles) return
    
    vehicles.forEach(vehicle => {
      if (vehicle.status === 'active') {
        // 更新速度
        vehicle.speed += (Math.random() - 0.5) * 10
        vehicle.speed = Math.max(0, Math.min(60, vehicle.speed))
        
        // 更新方向
        vehicle.direction += (Math.random() - 0.5) * 30
        vehicle.direction = (vehicle.direction + 360) % 360
        
        // 更新燃料
        vehicle.fuel -= Math.random() * 0.1
        vehicle.fuel = Math.max(0, vehicle.fuel)
        
        vehicle.lastUpdate = Date.now()
      }
    })
  }

  /**
   * 更新能耗数据
   */
  updateEnergyData() {
    const energy = this.cache.get('energy')
    if (!energy) return
    
    // 更新总能耗
    energy.total.current += (Math.random() - 0.5) * 100
    energy.total.current = Math.max(0, energy.total.current)
    
    // 更新可再生能源
    energy.renewable.solar += (Math.random() - 0.5) * 50
    energy.renewable.solar = Math.max(0, energy.renewable.solar)
    
    energy.renewable.wind += (Math.random() - 0.5) * 25
    energy.renewable.wind = Math.max(0, energy.renewable.wind)
    
    // 计算可再生能源百分比
    const totalRenewable = energy.renewable.solar + energy.renewable.wind
    energy.renewable.percentage = (totalRenewable / energy.total.current) * 100
    
    energy.lastUpdate = Date.now()
  }

  /**
   * 生成新告警
   */
  generateNewAlert() {
    const alerts = this.cache.get('alerts') || []
    const newAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: ['temperature', 'humidity', 'energy', 'security'][Math.floor(Math.random() * 4)],
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      message: this.generateAlertMessage(),
      source: `sensor_${Math.floor(Math.random() * 25)}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false
    }
    
    alerts.push(newAlert)
    
    // 保持告警数量在合理范围内
    if (alerts.length > 20) {
      alerts.shift()
    }
    
    this.cache.set('alerts', alerts)
    
    // 触发告警事件
    this.triggerCallback('newAlert', newAlert)
  }

  /**
   * 连接WebSocket
   */
  connectWebSocket(url = 'ws://localhost:8080/ws') {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      this.websocket = new WebSocket(url)
      
      this.websocket.onopen = (event) => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.triggerCallback('connectionChange', { connected: true })
      }
      
      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event.data)
      }
      
      this.websocket.onclose = (event) => {
        console.log('WebSocket disconnected')
        this.triggerCallback('connectionChange', { connected: false })
        this.attemptReconnect()
      }
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.triggerCallback('connectionError', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect()
    }
  }

  /**
   * 处理WebSocket消息
   */
  handleWebSocketMessage(data) {
    try {
      const message = JSON.parse(data)
      
      switch (message.type) {
        case 'sensorData':
          this.updateSensorFromWebSocket(message.data)
          break
        case 'buildingData':
          this.updateBuildingFromWebSocket(message.data)
          break
        case 'alert':
          this.handleWebSocketAlert(message.data)
          break
        default:
          console.warn('Unknown WebSocket message type:', message.type)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * 尝试重新连接
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }
    
    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    setTimeout(() => {
      this.connectWebSocket()
    }, this.reconnectInterval)
  }

  /**
   * 获取数据
   */
  getData(key) {
    return this.cache.get(key)
  }

  /**
   * 设置数据
   */
  setData(key, data) {
    this.cache.set(key, data)
    this.triggerCallback('dataChange', { key, data })
  }

  /**
   * 获取实时数据
   */
  getRealtimeData(key) {
    return this.realtimeData.get(key)
  }

  /**
   * 设置回调函数
   */
  setCallback(event, callback) {
    this.callbacks.set(event, callback)
  }

  /**
   * 触发回调函数
   */
  triggerCallback(event, data) {
    const callback = this.callbacks.get(event)
    if (callback && typeof callback === 'function') {
      callback(data)
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const buildings = this.getData('buildings') || []
    const sensors = this.getData('sensors') || []
    const alerts = this.getData('alerts') || []
    const vehicles = this.getData('vehicles') || []
    
    const onlineSensors = sensors.filter(s => s.status !== 'error').length
    const activeAlerts = alerts.filter(a => !a.resolved).length
    
    return {
      buildings: buildings.length,
      sensors: sensors.length,
      onlineDevices: onlineSensors,
      alerts: activeAlerts,
      vehicles: vehicles.length,
      connected: this.websocket?.readyState === WebSocket.OPEN || this.simulationEnabled
    }
  }

  /**
   * 导出数据
   */
  exportData() {
    const exportData = {}
    
    this.cache.forEach((value, key) => {
      exportData[key] = value
    })
    
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导入数据
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData)
      
      Object.entries(data).forEach(([key, value]) => {
        this.cache.set(key, value)
      })
      
      this.triggerCallback('dataImported', data)
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    // 停止模拟
    this.stopSimulation()
    
    // 断开WebSocket连接
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    
    // 清理缓存
    this.cache.clear()
    this.realtimeData.clear()
    
    // 清理回调
    this.callbacks.clear()
    
    console.log('DataManager disposed')
  }
}