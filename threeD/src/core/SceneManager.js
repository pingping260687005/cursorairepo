import * as THREE from 'three'

/**
 * 场景管理器 - 管理Three.js场景的创建、更新和渲染
 */
export class SceneManager {
  constructor(container) {
    this.container = container
    this.scene = null
    this.camera = null
    this.renderer = null
    this.clock = new THREE.Clock()
    
    // 渲染循环控制
    this.isRendering = false
    this.animationId = null
    
    // 性能监控
    this.frameCount = 0
    this.fps = 0
    this.lastTime = performance.now()
    
    this.init()
  }

  /**
   * 初始化场景、相机、渲染器
   */
  init() {
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.setupEventListeners()
    
    console.log('SceneManager initialized successfully')
  }

  /**
   * 创建场景
   */
  createScene() {
    this.scene = new THREE.Scene()
    
    // 设置场景背景
    this.scene.background = new THREE.Color(0x87CEEB) // 天蓝色背景
    
    // 添加雾效果，增强空间深度感
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 2000)
  }

  /**
   * 创建相机
   */
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight
    
    // 透视相机，适合3D场景
    this.camera = new THREE.PerspectiveCamera(
      60,    // fov - 视野角度
      aspect, // aspect - 宽高比
      0.1,   // near - 近裁剪面
      5000   // far - 远裁剪面
    )
    
    // 设置相机初始位置（鸟瞰视角）
    this.camera.position.set(100, 150, 200)
    this.camera.lookAt(0, 0, 0)
  }

  /**
   * 创建渲染器
   */
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,           // 抗锯齿
      alpha: true,               // 透明度支持
      powerPreference: 'high-performance'  // 高性能模式
    })
    
    // 设置渲染器属性
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比，避免性能问题
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // 软阴影
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    
    // 将渲染器的canvas添加到容器
    this.container.appendChild(this.renderer.domElement)
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 窗口大小调整
    window.addEventListener('resize', this.onWindowResize.bind(this))
    
    // 页面可见性变化（优化性能）
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this))
  }

  /**
   * 窗口大小调整处理
   */
  onWindowResize() {
    if (!this.camera || !this.renderer) return
    
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    
    // 更新相机宽高比
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    // 更新渲染器尺寸
    this.renderer.setSize(width, height)
  }

  /**
   * 页面可见性变化处理
   */
  onVisibilityChange() {
    if (document.hidden) {
      this.pauseRendering()
    } else {
      this.resumeRendering()
    }
  }

  /**
   * 添加对象到场景
   */
  addObject(object) {
    if (object && this.scene) {
      this.scene.add(object)
      return true
    }
    return false
  }

  /**
   * 从场景移除对象
   */
  removeObject(object) {
    if (object && this.scene) {
      this.scene.remove(object)
      
      // 清理几何体和材质，防止内存泄漏
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
      
      return true
    }
    return false
  }

  /**
   * 开始渲染循环
   */
  startRendering() {
    if (this.isRendering) return
    
    this.isRendering = true
    this.animate()
    console.log('Rendering started')
  }

  /**
   * 停止渲染循环
   */
  stopRendering() {
    this.isRendering = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    console.log('Rendering stopped')
  }

  /**
   * 暂停渲染
   */
  pauseRendering() {
    this.isRendering = false
  }

  /**
   * 恢复渲染
   */
  resumeRendering() {
    if (!this.isRendering) {
      this.isRendering = true
      this.animate()
    }
  }

  /**
   * 动画循环
   */
  animate() {
    if (!this.isRendering) return
    
    this.animationId = requestAnimationFrame(this.animate.bind(this))
    
    // 更新性能计数器
    this.updateFPS()
    
    // 渲染场景
    this.render()
  }

  /**
   * 渲染场景
   */
  render() {
    if (!this.renderer || !this.scene || !this.camera) return
    
    // 获取时间差，用于动画计算
    const deltaTime = this.clock.getDelta()
    
    // 渲染场景
    this.renderer.render(this.scene, this.camera)
    
    // 分发渲染事件（供其他组件使用）
    this.dispatchEvent('render', { deltaTime })
  }

  /**
   * 更新FPS计算
   */
  updateFPS() {
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime
      
      // 更新FPS显示
      this.dispatchEvent('fpsUpdate', { fps: this.fps })
    }
  }

  /**
   * 事件分发器
   */
  dispatchEvent(eventName, data = {}) {
    const event = new CustomEvent(`sceneManager:${eventName}`, { detail: data })
    document.dispatchEvent(event)
  }

  /**
   * 获取场景统计信息
   */
  getSceneStats() {
    if (!this.scene || !this.renderer) return null
    
    const info = this.renderer.info
    
    return {
      objects: this.scene.children.length,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      triangles: info.render.triangles,
      calls: info.render.calls,
      fps: this.fps
    }
  }

  /**
   * 设置渲染质量
   */
  setRenderQuality(quality) {
    if (!this.renderer) return
    
    switch (quality) {
      case 'low':
        this.renderer.setPixelRatio(1)
        this.renderer.shadowMap.enabled = false
        break
      case 'medium':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.BasicShadowMap
        break
      case 'high':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        break
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.stopRendering()
    
    // 移除事件监听器
    window.removeEventListener('resize', this.onWindowResize.bind(this))
    document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this))
    
    // 清理场景中的所有对象
    if (this.scene) {
      while (this.scene.children.length > 0) {
        this.removeObject(this.scene.children[0])
      }
    }
    
    // 清理渲染器
    if (this.renderer) {
      this.renderer.dispose()
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement)
      }
    }
    
    console.log('SceneManager disposed')
  }
}