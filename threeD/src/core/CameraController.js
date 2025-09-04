import * as THREE from 'three'

/**
 * 相机控制器 - 处理相机的移动、旋转、缩放等交互操作
 */
export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement
    
    // 控制参数
    this.enabled = true
    this.target = new THREE.Vector3(0, 0, 0)
    
    // 轨道控制参数
    this.minDistance = 10
    this.maxDistance = 1000
    this.minPolarAngle = 0 // 最小极角（上下旋转限制）
    this.maxPolarAngle = Math.PI // 最大极角
    
    // 旋转参数
    this.rotateSpeed = 1.0
    this.panSpeed = 1.0
    this.zoomSpeed = 1.0
    
    // 阻尼参数
    this.enableDamping = true
    this.dampingFactor = 0.05
    
    // 自动旋转
    this.autoRotate = false
    this.autoRotateSpeed = 2.0
    
    // 内部状态
    this.spherical = new THREE.Spherical()
    this.sphericalDelta = new THREE.Spherical()
    this.scale = 1
    this.panOffset = new THREE.Vector3()
    
    // 鼠标状态
    this.rotateStart = new THREE.Vector2()
    this.rotateEnd = new THREE.Vector2()
    this.rotateDelta = new THREE.Vector2()
    
    this.panStart = new THREE.Vector2()
    this.panEnd = new THREE.Vector2()
    this.panDelta = new THREE.Vector2()
    
    // 状态枚举
    this.STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    }
    
    this.state = this.STATE.NONE
    
    // 预设视角
    this.presetViews = {
      bird: { position: [0, 200, 0], target: [0, 0, 0] },
      front: { position: [0, 50, 200], target: [0, 0, 0] },
      side: { position: [200, 50, 0], target: [0, 0, 0] },
      isometric: { position: [100, 100, 100], target: [0, 0, 0] }
    }
    
    this.init()
  }

  /**
   * 初始化控制器
   */
  init() {
    this.setupEventListeners()
    this.updateSphereical()
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 鼠标事件
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this))
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this))
    
    // 键盘事件
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    
    // 触摸事件（移动设备支持）
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this))
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this))
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this))
  }

  /**
   * 鼠标按下事件
   */
  onMouseDown(event) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    switch (event.button) {
      case 0: // 左键 - 旋转
        this.handleMouseDownRotate(event)
        this.state = this.STATE.ROTATE
        break
      case 1: // 中键 - 缩放
        this.handleMouseDownDolly(event)
        this.state = this.STATE.DOLLY
        break
      case 2: // 右键 - 平移
        this.handleMouseDownPan(event)
        this.state = this.STATE.PAN
        break
    }
    
    if (this.state !== this.STATE.NONE) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this))
      document.addEventListener('mouseup', this.onMouseUp.bind(this))
    }
  }

  /**
   * 鼠标移动事件
   */
  onMouseMove(event) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    switch (this.state) {
      case this.STATE.ROTATE:
        this.handleMouseMoveRotate(event)
        break
      case this.STATE.DOLLY:
        this.handleMouseMoveDolly(event)
        break
      case this.STATE.PAN:
        this.handleMouseMovePan(event)
        break
    }
  }

  /**
   * 鼠标抬起事件
   */
  onMouseUp(event) {
    if (!this.enabled) return
    
    document.removeEventListener('mousemove', this.onMouseMove.bind(this))
    document.removeEventListener('mouseup', this.onMouseUp.bind(this))
    
    this.state = this.STATE.NONE
  }

  /**
   * 鼠标滚轮事件
   */
  onMouseWheel(event) {
    if (!this.enabled) return
    
    event.preventDefault()
    event.stopPropagation()
    
    this.handleMouseWheel(event)
  }

  /**
   * 处理旋转开始
   */
  handleMouseDownRotate(event) {
    this.rotateStart.set(event.clientX, event.clientY)
  }

  /**
   * 处理旋转移动
   */
  handleMouseMoveRotate(event) {
    this.rotateEnd.set(event.clientX, event.clientY)
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)
    
    const element = this.domElement
    
    // 水平旋转（绕Y轴）
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight)
    
    // 垂直旋转（绕X轴）
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight)
    
    this.rotateStart.copy(this.rotateEnd)
  }

  /**
   * 处理平移开始
   */
  handleMouseDownPan(event) {
    this.panStart.set(event.clientX, event.clientY)
  }

  /**
   * 处理平移移动
   */
  handleMouseMovePan(event) {
    this.panEnd.set(event.clientX, event.clientY)
    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)
    
    this.pan(this.panDelta.x, this.panDelta.y)
    
    this.panStart.copy(this.panEnd)
  }

  /**
   * 处理缩放开始
   */
  handleMouseDownDolly(event) {
    // 中键缩放的起始处理
  }

  /**
   * 处理缩放移动
   */
  handleMouseMoveDolly(event) {
    // 中键缩放的移动处理（可以根据需要实现）
  }

  /**
   * 处理滚轮缩放
   */
  handleMouseWheel(event) {
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale())
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale())
    }
  }

  /**
   * 键盘事件处理
   */
  onKeyDown(event) {
    if (!this.enabled) return
    
    const panAmount = 10 // 键盘平移距离
    
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.pan(0, panAmount)
        break
      case 'ArrowLeft':
      case 'KeyA':
        this.pan(panAmount, 0)
        break
      case 'ArrowDown':
      case 'KeyS':
        this.pan(0, -panAmount)
        break
      case 'ArrowRight':
      case 'KeyD':
        this.pan(-panAmount, 0)
        break
    }
  }

  /**
   * 触摸事件处理
   */
  onTouchStart(event) {
    if (!this.enabled) return
    
    switch (event.touches.length) {
      case 1: // 单指旋转
        this.handleTouchStartRotate(event)
        this.state = this.STATE.TOUCH_ROTATE
        break
      case 2: // 双指缩放和平移
        this.handleTouchStartDollyPan(event)
        this.state = this.STATE.TOUCH_DOLLY_PAN
        break
    }
  }

  onTouchMove(event) {
    if (!this.enabled) return
    
    event.preventDefault()
    event.stopPropagation()
    
    switch (this.state) {
      case this.STATE.TOUCH_ROTATE:
        this.handleTouchMoveRotate(event)
        break
      case this.STATE.TOUCH_DOLLY_PAN:
        this.handleTouchMoveDollyPan(event)
        break
    }
  }

  onTouchEnd(event) {
    if (!this.enabled) return
    
    this.state = this.STATE.NONE
  }

  /**
   * 处理触摸旋转开始
   */
  handleTouchStartRotate(event) {
    this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY)
  }

  /**
   * 处理触摸旋转移动
   */
  handleTouchMoveRotate(event) {
    this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)
    
    const element = this.domElement
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight)
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight)
    
    this.rotateStart.copy(this.rotateEnd)
  }

  /**
   * 处理触摸缩放和平移开始
   */
  handleTouchStartDollyPan(event) {
    // 实现双指操作的逻辑
  }

  /**
   * 处理触摸缩放和平移移动
   */
  handleTouchMoveDollyPan(event) {
    // 实现双指操作的逻辑
  }

  /**
   * 阻止右键菜单
   */
  onContextMenu(event) {
    if (!this.enabled) return
    event.preventDefault()
  }

  /**
   * 左旋转
   */
  rotateLeft(angle) {
    this.sphericalDelta.theta -= angle
  }

  /**
   * 上旋转
   */
  rotateUp(angle) {
    this.sphericalDelta.phi -= angle
  }

  /**
   * 平移
   */
  pan(deltaX, deltaY) {
    const element = this.domElement
    const position = this.camera.position
    
    let offset = position.clone().sub(this.target)
    let targetDistance = offset.length()
    
    // 根据相机距离调整平移速度
    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0)
    
    const panLeft = new THREE.Vector3()
    const panUp = new THREE.Vector3()
    
    // 计算相机的本地坐标系
    panLeft.setFromMatrixColumn(this.camera.matrix, 0)
    panUp.setFromMatrixColumn(this.camera.matrix, 1)
    
    panLeft.multiplyScalar(-2 * deltaX * targetDistance / element.clientHeight)
    panUp.multiplyScalar(2 * deltaY * targetDistance / element.clientHeight)
    
    this.panOffset.copy(panLeft).add(panUp)
  }

  /**
   * 缩放
   */
  dollyIn(dollyScale) {
    this.scale /= dollyScale
  }

  dollyOut(dollyScale) {
    this.scale *= dollyScale
  }

  /**
   * 获取缩放比例
   */
  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed)
  }

  /**
   * 更新球坐标系
   */
  updateSphereical() {
    const offset = new THREE.Vector3()
    offset.copy(this.camera.position).sub(this.target)
    this.spherical.setFromVector3(offset)
  }

  /**
   * 更新相机位置
   */
  update() {
    if (!this.enabled) return false
    
    const offset = new THREE.Vector3()
    const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0))
    const quatInverse = quat.clone().invert()
    
    const lastPosition = new THREE.Vector3()
    const lastQuaternion = new THREE.Quaternion()
    
    lastPosition.copy(this.camera.position)
    lastQuaternion.copy(this.camera.quaternion)
    
    // 应用旋转增量
    this.spherical.theta += this.sphericalDelta.theta
    this.spherical.phi += this.sphericalDelta.phi
    
    // 限制极角
    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi))
    this.spherical.makeSafe()
    
    // 应用缩放
    this.spherical.radius *= this.scale
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius))
    
    // 应用平移
    this.target.add(this.panOffset)
    
    // 计算新的相机位置
    offset.setFromSpherical(this.spherical)
    offset.applyQuaternion(quat)
    
    this.camera.position.copy(this.target).add(offset)
    this.camera.lookAt(this.target)
    
    // 阻尼处理
    if (this.enableDamping) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor)
      this.sphericalDelta.phi *= (1 - this.dampingFactor)
      this.panOffset.multiplyScalar(1 - this.dampingFactor)
    } else {
      this.sphericalDelta.set(0, 0, 0)
      this.panOffset.set(0, 0, 0)
    }
    
    this.scale = 1
    
    // 自动旋转
    if (this.autoRotate && this.state === this.STATE.NONE) {
      this.rotateLeft(this.getAutoRotationAngle())
    }
    
    // 检查相机是否移动
    if (lastPosition.distanceToSquared(this.camera.position) > 0.000001 ||
        8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > 0.000001) {
      this.dispatchEvent('change')
      return true
    }
    
    return false
  }

  /**
   * 获取自动旋转角度
   */
  getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed
  }

  /**
   * 切换到预设视角
   */
  setPresetView(viewName, duration = 1000) {
    const preset = this.presetViews[viewName]
    if (!preset) {
      console.warn(`预设视角 "${viewName}" 不存在`)
      return
    }
    
    this.animateToPosition(
      new THREE.Vector3(...preset.position),
      new THREE.Vector3(...preset.target),
      duration
    )
  }

  /**
   * 动画到指定位置
   */
  animateToPosition(targetPosition, targetLookAt, duration = 1000) {
    const startPosition = this.camera.position.clone()
    const startTarget = this.target.clone()
    const startTime = performance.now()
    
    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用缓动函数
      const easeProgress = this.easeInOutCubic(progress)
      
      // 插值位置
      this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress)
      this.target.lerpVectors(startTarget, targetLookAt, easeProgress)
      
      // 更新相机朝向
      this.camera.lookAt(this.target)
      this.updateSphereical()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  /**
   * 缓动函数
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /**
   * 事件分发
   */
  dispatchEvent(eventName) {
    const event = new CustomEvent(`cameraController:${eventName}`)
    document.dispatchEvent(event)
  }

  /**
   * 启用/禁用控制器
   */
  setEnabled(enabled) {
    this.enabled = enabled
  }

  /**
   * 清理资源
   */
  dispose() {
    // 移除事件监听器
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this))
    this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this))
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this))
    
    window.removeEventListener('keydown', this.onKeyDown.bind(this))
    
    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this))
    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this))
    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this))
    
    console.log('CameraController disposed')
  }
}