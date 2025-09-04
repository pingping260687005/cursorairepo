import * as THREE from 'three'

/**
 * 模型工厂 - 创建各种3D模型对象
 */
export class ModelFactory {
  constructor() {
    // 材质缓存
    this.materials = new Map()
    // 几何体缓存
    this.geometries = new Map()
    
    this.initMaterials()
  }

  /**
   * 初始化常用材质
   */
  initMaterials() {
    // 建筑物材质
    this.materials.set('building', new THREE.MeshLambertMaterial({
      color: 0xcccccc,
      transparent: false
    }))
    
    this.materials.set('building-glass', new THREE.MeshPhongMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.3,
      reflectivity: 0.8
    }))
    
    // 地面材质
    this.materials.set('ground', new THREE.MeshLambertMaterial({
      color: 0x4a7c59
    }))
    
    // 道路材质
    this.materials.set('road', new THREE.MeshLambertMaterial({
      color: 0x444444
    }))
    
    // 传感器材质
    this.materials.set('sensor-normal', new THREE.MeshBasicMaterial({
      color: 0x00ff00
    }))
    
    this.materials.set('sensor-warning', new THREE.MeshBasicMaterial({
      color: 0xff8800
    }))
    
    this.materials.set('sensor-error', new THREE.MeshBasicMaterial({
      color: 0xff0000
    }))
    
    // 车辆材质
    this.materials.set('vehicle', new THREE.MeshLambertMaterial({
      color: 0x3366cc
    }))
    
    // 植被材质
    this.materials.set('tree', new THREE.MeshLambertMaterial({
      color: 0x228b22
    }))
  }

  /**
   * 创建地面
   */
  createGround(width = 400, height = 400) {
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = this.materials.get('ground')
    
    const ground = new THREE.Mesh(geometry, material)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.name = 'ground'
    
    return ground
  }

  /**
   * 创建建筑物
   */
  createBuilding(config = {}) {
    const {
      width = 20,
      height = 30,
      depth = 20,
      position = { x: 0, y: 0, z: 0 },
      color = 0xcccccc,
      type = 'office'
    } = config
    
    const group = new THREE.Group()
    
    // 主体建筑
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new THREE.MeshLambertMaterial({ color })
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    
    building.position.y = height / 2
    building.castShadow = true
    building.receiveShadow = true
    
    // 添加窗户
    this.addWindows(building, width, height, depth)
    
    group.add(building)
    group.position.set(position.x, position.y, position.z)
    group.name = `building_${type}`
    group.userData = {
      type: 'building',
      subtype: type,
      width,
      height,
      depth,
      occupancy: Math.random() * 100,
      energy: Math.random() * 1000
    }
    
    return group
  }

  /**
   * 为建筑物添加窗户
   */
  addWindows(building, width, height, depth) {
    const windowMaterial = this.materials.get('building-glass')
    const windowSize = 2
    const windowSpacing = 4
    
    // 前后面窗户
    for (let x = -width/2 + windowSpacing; x < width/2; x += windowSpacing) {
      for (let y = windowSpacing; y < height - windowSpacing; y += windowSpacing) {
        // 前面
        const frontWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterial
        )
        frontWindow.position.set(x, y, depth/2 + 0.1)
        building.add(frontWindow)
        
        // 后面
        const backWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterial
        )
        backWindow.position.set(x, y, -depth/2 - 0.1)
        backWindow.rotation.y = Math.PI
        building.add(backWindow)
      }
    }
    
    // 左右面窗户
    for (let z = -depth/2 + windowSpacing; z < depth/2; z += windowSpacing) {
      for (let y = windowSpacing; y < height - windowSpacing; y += windowSpacing) {
        // 左面
        const leftWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterial
        )
        leftWindow.position.set(-width/2 - 0.1, y, z)
        leftWindow.rotation.y = Math.PI / 2
        building.add(leftWindow)
        
        // 右面
        const rightWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterial
        )
        rightWindow.position.set(width/2 + 0.1, y, z)
        rightWindow.rotation.y = -Math.PI / 2
        building.add(rightWindow)
      }
    }
  }

  /**
   * 创建道路网络
   */
  createRoadNetwork() {
    const group = new THREE.Group()
    
    // 主干道
    const mainRoad1 = this.createRoad(400, 8, { x: 0, y: 0.01, z: 0 })
    const mainRoad2 = this.createRoad(8, 400, { x: 0, y: 0.01, z: 0 })
    
    // 次干道
    const secondaryRoad1 = this.createRoad(200, 6, { x: 100, y: 0.01, z: 0 })
    const secondaryRoad2 = this.createRoad(200, 6, { x: -100, y: 0.01, z: 0 })
    const secondaryRoad3 = this.createRoad(6, 200, { x: 0, y: 0.01, z: 100 })
    const secondaryRoad4 = this.createRoad(6, 200, { x: 0, y: 0.01, z: -100 })
    
    group.add(mainRoad1, mainRoad2)
    group.add(secondaryRoad1, secondaryRoad2, secondaryRoad3, secondaryRoad4)
    group.name = 'roadNetwork'
    
    return group
  }

  /**
   * 创建单条道路
   */
  createRoad(width, length, position) {
    const geometry = new THREE.PlaneGeometry(width, length)
    const material = this.materials.get('road')
    
    const road = new THREE.Mesh(geometry, material)
    road.rotation.x = -Math.PI / 2
    road.position.set(position.x, position.y, position.z)
    road.receiveShadow = true
    
    return road
  }

  /**
   * 创建传感器
   */
  createSensor(config = {}) {
    const {
      position = { x: 0, y: 0, z: 0 },
      type = 'temperature',
      status = 'normal'
    } = config
    
    const group = new THREE.Group()
    
    // 传感器主体
    const sensorGeometry = new THREE.SphereGeometry(0.5, 8, 6)
    const materialKey = `sensor-${status}`
    const sensorMaterial = this.materials.get(materialKey) || this.materials.get('sensor-normal')
    
    const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial)
    sensor.position.y = 1
    
    // 传感器支柱
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8)
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 1
    
    group.add(sensor, pole)
    group.position.set(position.x, position.y, position.z)
    group.name = `sensor_${type}`
    group.userData = {
      type: 'sensor',
      subtype: type,
      status,
      value: Math.random() * 100,
      lastUpdate: Date.now()
    }
    
    return group
  }

  /**
   * 创建车辆
   */
  createVehicle(config = {}) {
    const {
      position = { x: 0, y: 0, z: 0 },
      type = 'car',
      color = 0x3366cc
    } = config
    
    const group = new THREE.Group()
    
    // 车身
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 2)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1
    body.castShadow = true
    
    // 车顶
    const roofGeometry = new THREE.BoxGeometry(3, 1, 1.8)
    const roofMaterial = new THREE.MeshLambertMaterial({ color: color * 0.8 })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = 2
    roof.castShadow = true
    
    // 车轮
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8)
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    
    const wheels = []
    const wheelPositions = [
      { x: -1.5, y: 0.4, z: -1 },
      { x: 1.5, y: 0.4, z: -1 },
      { x: -1.5, y: 0.4, z: 1 },
      { x: 1.5, y: 0.4, z: 1 }
    ]
    
    wheelPositions.forEach((pos, index) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.position.set(pos.x, pos.y, pos.z)
      wheel.rotation.z = Math.PI / 2
      wheel.castShadow = true
      wheels.push(wheel)
      group.add(wheel)
    })
    
    group.add(body, roof)
    group.position.set(position.x, position.y, position.z)
    group.name = `vehicle_${type}`
    group.userData = {
      type: 'vehicle',
      subtype: type,
      speed: 0,
      direction: 0,
      wheels
    }
    
    return group
  }

  /**
   * 创建树木
   */
  createTree(config = {}) {
    const {
      position = { x: 0, y: 0, z: 0 },
      scale = 1
    } = config
    
    const group = new THREE.Group()
    
    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.8 * scale, 6 * scale, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 3 * scale
    trunk.castShadow = true
    
    // 树冠
    const crownGeometry = new THREE.SphereGeometry(3 * scale, 8, 6)
    const crownMaterial = this.materials.get('tree')
    const crown = new THREE.Mesh(crownGeometry, crownMaterial)
    crown.position.y = 7 * scale
    crown.castShadow = true
    
    group.add(trunk, crown)
    group.position.set(position.x, position.y, position.z)
    group.scale.set(scale, scale, scale)
    group.name = 'tree'
    group.userData = {
      type: 'vegetation',
      subtype: 'tree'
    }
    
    return group
  }

  /**
   * 创建园区整体布局
   */
  createParkLayout() {
    const parkGroup = new THREE.Group()
    
    // 添加地面
    const ground = this.createGround(400, 400)
    parkGroup.add(ground)
    
    // 添加道路网络
    const roads = this.createRoadNetwork()
    parkGroup.add(roads)
    
    // 添加建筑物
    const buildings = this.createBuildingCluster()
    parkGroup.add(buildings)
    
    // 添加绿化
    const vegetation = this.createVegetation()
    parkGroup.add(vegetation)
    
    // 添加传感器网络
    const sensors = this.createSensorNetwork()
    parkGroup.add(sensors)
    
    parkGroup.name = 'smartPark'
    
    return parkGroup
  }

  /**
   * 创建建筑群
   */
  createBuildingCluster() {
    const group = new THREE.Group()
    
    const buildingConfigs = [
      { position: { x: -80, y: 0, z: -80 }, width: 25, height: 40, depth: 25, color: 0xaaaaaa, type: 'office' },
      { position: { x: -80, y: 0, z: 80 }, width: 30, height: 35, depth: 20, color: 0xbbbbbb, type: 'research' },
      { position: { x: 80, y: 0, z: -80 }, width: 20, height: 50, depth: 30, color: 0x999999, type: 'datacenter' },
      { position: { x: 80, y: 0, z: 80 }, width: 35, height: 25, depth: 25, color: 0xcccccc, type: 'warehouse' },
      { position: { x: -40, y: 0, z: 0 }, width: 15, height: 30, depth: 15, color: 0xdddddd, type: 'utility' },
      { position: { x: 40, y: 0, z: 0 }, width: 18, height: 28, depth: 18, color: 0xaacccc, type: 'office' },
      { position: { x: 0, y: 0, z: -40 }, width: 22, height: 32, depth: 22, color: 0xccaacc, type: 'mixed' },
      { position: { x: 0, y: 0, z: 40 }, width: 28, height: 38, depth: 20, color: 0xaaccaa, type: 'innovation' }
    ]
    
    buildingConfigs.forEach(config => {
      const building = this.createBuilding(config)
      group.add(building)
    })
    
    group.name = 'buildings'
    return group
  }

  /**
   * 创建植被
   */
  createVegetation() {
    const group = new THREE.Group()
    
    // 随机分布树木
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 350
      const z = (Math.random() - 0.5) * 350
      
      // 避免在道路上生成树木
      if (Math.abs(x) < 10 || Math.abs(z) < 10) continue
      
      const tree = this.createTree({
        position: { x, y: 0, z },
        scale: 0.5 + Math.random() * 0.5
      })
      
      group.add(tree)
    }
    
    group.name = 'vegetation'
    return group
  }

  /**
   * 创建传感器网络
   */
  createSensorNetwork() {
    const group = new THREE.Group()
    
    const sensorTypes = ['temperature', 'humidity', 'air_quality', 'motion', 'sound']
    const statusOptions = ['normal', 'warning', 'error']
    
    // 在建筑物周围部署传感器
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 300
      const z = (Math.random() - 0.5) * 300
      
      const sensor = this.createSensor({
        position: { x, y: 0, z },
        type: sensorTypes[Math.floor(Math.random() * sensorTypes.length)],
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)]
      })
      
      group.add(sensor)
    }
    
    group.name = 'sensors'
    return group
  }

  /**
   * 创建动画车辆
   */
  createMovingVehicles() {
    const group = new THREE.Group()
    
    for (let i = 0; i < 5; i++) {
      const vehicle = this.createVehicle({
        position: {
          x: (Math.random() - 0.5) * 100,
          y: 0.1,
          z: (Math.random() - 0.5) * 100
        },
        color: Math.random() * 0xffffff
      })
      
      // 添加移动路径
      vehicle.userData.path = this.generateVehiclePath()
      vehicle.userData.pathIndex = 0
      vehicle.userData.speed = 0.2 + Math.random() * 0.3
      
      group.add(vehicle)
    }
    
    group.name = 'vehicles'
    return group
  }

  /**
   * 生成车辆移动路径
   */
  generateVehiclePath() {
    const path = []
    const roads = [
      { start: { x: -200, z: 0 }, end: { x: 200, z: 0 } },
      { start: { x: 0, z: -200 }, end: { x: 0, z: 200 } },
      { start: { x: -100, z: -200 }, end: { x: -100, z: 200 } },
      { start: { x: 100, z: -200 }, end: { x: 100, z: 200 } }
    ]
    
    const selectedRoad = roads[Math.floor(Math.random() * roads.length)]
    const steps = 20
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      path.push({
        x: selectedRoad.start.x + (selectedRoad.end.x - selectedRoad.start.x) * t,
        y: 0.1,
        z: selectedRoad.start.z + (selectedRoad.end.z - selectedRoad.start.z) * t
      })
    }
    
    return path
  }

  /**
   * 获取材质
   */
  getMaterial(name) {
    return this.materials.get(name)
  }

  /**
   * 添加自定义材质
   */
  addMaterial(name, material) {
    this.materials.set(name, material)
  }

  /**
   * 清理资源
   */
  dispose() {
    // 清理材质
    this.materials.forEach(material => {
      if (material.map) material.map.dispose()
      if (material.normalMap) material.normalMap.dispose()
      if (material.roughnessMap) material.roughnessMap.dispose()
      material.dispose()
    })
    
    // 清理几何体
    this.geometries.forEach(geometry => {
      geometry.dispose()
    })
    
    this.materials.clear()
    this.geometries.clear()
    
    console.log('ModelFactory disposed')
  }
}