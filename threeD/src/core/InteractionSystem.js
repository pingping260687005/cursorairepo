import * as THREE from 'three'

/**
 * 交互系统 - 处理鼠标事件和对象选择
 */
export class InteractionSystem {
  constructor(camera, scene, domElement) {
    this.camera = camera
    this.scene = scene
    this.domElement = domElement
    
    // 射线投射器
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    
    // 交互状态
    this.selectedObject = null
    this.hoveredObject = null
    this.interactiveObjects = new Set()
    
    // 高亮材质
    this.originalMaterials = new Map()
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    
    this.selectedMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
    
    // 事件回调
    this.callbacks = new Map()
    
    // 交互模式
    this.interactionEnabled = true
    this.selectMode = 'single' // 'single' | 'multiple'
    
    this.init()
  }

  /**
   * 初始化交互系统
   */
  init() {
    this.setupEventListeners()
    this.collectInteractiveObjects()
    
    console.log('InteractionSystem initialized')
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 鼠标移动事件
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    
    // 鼠标点击事件
    this.domElement.addEventListener('click', this.onClick.bind(this))
    
    // 鼠标双击事件
    this.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this))
    
    // 鼠标右键事件
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this))
    
    // 键盘事件
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    
    // 窗口失焦事件
    window.addEventListener('blur', this.onWindowBlur.bind(this))
  }

  /**
   * 收集可交互对象
   */
  collectInteractiveObjects() {
    this.interactiveObjects.clear()
    
    this.scene.traverse((object) => {
      // 检查对象是否有用户数据，表明它是可交互的
      if (object.userData && (object.userData.type || object.userData.interactive)) {
        this.interactiveObjects.add(object)
        
        // 如果对象有子对象，也添加到交互列表
        object.traverse((child) => {
          if (child !== object && child.isMesh) {
            this.interactiveObjects.add(child)
          }
        })
      }
    })
    
    console.log(`Found ${this.interactiveObjects.size} interactive objects`)
  }

  /**
   * 鼠标移动事件处理
   */
  onMouseMove(event) {
    if (!this.interactionEnabled) return
    
    // 更新鼠标坐标
    this.updateMousePosition(event)
    
    // 执行射线投射
    const intersects = this.performRaycast()
    
    // 处理悬停效果
    this.handleHover(intersects)
  }

  /**
   * 鼠标点击事件处理
   */
  onClick(event) {
    if (!this.interactionEnabled) return
    
    // 更新鼠标坐标
    this.updateMousePosition(event)
    
    // 执行射线投射
    const intersects = this.performRaycast()
    
    // 处理选择
    this.handleSelection(intersects)
  }

  /**
   * 鼠标双击事件处理
   */
  onDoubleClick(event) {
    if (!this.interactionEnabled) return
    
    // 更新鼠标坐标
    this.updateMousePosition(event)
    
    // 执行射线投射
    const intersects = this.performRaycast()
    
    // 处理双击聚焦
    this.handleDoubleClick(intersects)
  }

  /**
   * 右键菜单事件处理
   */
  onContextMenu(event) {
    event.preventDefault()
    
    if (!this.interactionEnabled) return
    
    // 更新鼠标坐标
    this.updateMousePosition(event)
    
    // 执行射线投射
    const intersects = this.performRaycast()
    
    // 显示上下文菜单
    this.showContextMenu(event, intersects)
  }

  /**
   * 键盘事件处理
   */
  onKeyDown(event) {
    if (!this.interactionEnabled) return
    
    switch (event.code) {
      case 'Escape':
        this.clearSelection()
        break
        
      case 'Delete':
        if (this.selectedObject) {
          this.triggerCallback('deleteObject', this.selectedObject)
        }
        break
        
      case 'KeyF':
        if (this.selectedObject) {
          this.focusOnObject(this.selectedObject)
        }
        break
    }
  }

  /**
   * 窗口失焦事件处理
   */
  onWindowBlur() {
    this.clearHover()
  }

  /**
   * 更新鼠标位置
   */
  updateMousePosition(event) {
    const rect = this.domElement.getBoundingClientRect()
    
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  /**
   * 执行射线投射
   */
  performRaycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    // 只检测交互对象
    const objects = Array.from(this.interactiveObjects)
    const intersects = this.raycaster.intersectObjects(objects, false)
    
    return intersects
  }

  /**
   * 处理悬停效果
   */
  handleHover(intersects) {
    const previousHovered = this.hoveredObject
    
    if (intersects.length > 0) {
      const object = this.findInteractiveParent(intersects[0].object)
      
      if (object && object !== this.selectedObject) {
        this.setHoveredObject(object)
      } else {
        this.clearHover()
      }
    } else {
      this.clearHover()
    }
    
    // 触发悬停状态变化事件
    if (previousHovered !== this.hoveredObject) {
      this.triggerCallback('hoverChange', {
        previous: previousHovered,
        current: this.hoveredObject
      })
    }
  }

  /**
   * 处理选择
   */
  handleSelection(intersects) {
    if (intersects.length > 0) {
      const object = this.findInteractiveParent(intersects[0].object)
      
      if (object) {
        if (this.selectMode === 'multiple' && event.ctrlKey) {
          // 多选模式
          this.toggleSelection(object)
        } else {
          // 单选模式
          this.setSelectedObject(object)
        }
      }
    } else {
      // 点击空白区域，清除选择
      this.clearSelection()
    }
  }

  /**
   * 处理双击聚焦
   */
  handleDoubleClick(intersects) {
    if (intersects.length > 0) {
      const object = this.findInteractiveParent(intersects[0].object)
      
      if (object) {
        this.focusOnObject(object)
        this.triggerCallback('objectFocus', object)
      }
    }
  }

  /**
   * 显示上下文菜单
   */
  showContextMenu(event, intersects) {
    const menuItems = []
    
    if (intersects.length > 0) {
      const object = this.findInteractiveParent(intersects[0].object)
      
      if (object) {
        menuItems.push(
          { label: '选择', action: () => this.setSelectedObject(object) },
          { label: '聚焦', action: () => this.focusOnObject(object) },
          { label: '详细信息', action: () => this.triggerCallback('showObjectInfo', object) }
        )
        
        // 根据对象类型添加特定选项
        if (object.userData.type === 'building') {
          menuItems.push(
            { label: '查看能耗', action: () => this.triggerCallback('showEnergyInfo', object) }
          )
        } else if (object.userData.type === 'sensor') {
          menuItems.push(
            { label: '查看数据', action: () => this.triggerCallback('showSensorData', object) }
          )
        }
      }
    } else {
      menuItems.push(
        { label: '重置视角', action: () => this.triggerCallback('resetView') },
        { label: '全览', action: () => this.triggerCallback('overviewView') }
      )
    }
    
    this.triggerCallback('showContextMenu', {
      position: { x: event.clientX, y: event.clientY },
      items: menuItems
    })
  }

  /**
   * 查找交互父对象
   */
  findInteractiveParent(object) {
    let current = object
    
    while (current && current !== this.scene) {
      if (this.interactiveObjects.has(current)) {
        return current
      }
      current = current.parent
    }
    
    return null
  }

  /**
   * 设置悬停对象
   */
  setHoveredObject(object) {
    // 清除之前的悬停效果
    this.clearHover()
    
    this.hoveredObject = object
    this.applyHoverEffect(object)
    
    // 更改光标样式
    this.domElement.style.cursor = 'pointer'
  }

  /**
   * 清除悬停效果
   */
  clearHover() {
    if (this.hoveredObject) {
      this.removeHoverEffect(this.hoveredObject)
      this.hoveredObject = null
    }
    
    // 恢复光标样式
    this.domElement.style.cursor = 'default'
  }

  /**
   * 设置选中对象
   */
  setSelectedObject(object) {
    // 清除之前的选择
    this.clearSelection()
    
    this.selectedObject = object
    this.applySelectionEffect(object)
    
    // 触发选择事件
    this.triggerCallback('objectSelected', object)
  }

  /**
   * 清除选择
   */
  clearSelection() {
    if (this.selectedObject) {
      this.removeSelectionEffect(this.selectedObject)
      this.selectedObject = null
      
      // 触发清除选择事件
      this.triggerCallback('selectionCleared')
    }
  }

  /**
   * 切换选择状态
   */
  toggleSelection(object) {
    if (this.selectedObject === object) {
      this.clearSelection()
    } else {
      this.setSelectedObject(object)
    }
  }

  /**
   * 聚焦到对象
   */
  focusOnObject(object) {
    if (!object) return
    
    // 计算对象的边界盒
    const box = new THREE.Box3().setFromObject(object)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    // 计算合适的相机距离
    const maxDimension = Math.max(size.x, size.y, size.z)
    const distance = maxDimension * 2
    
    // 计算新的相机位置
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    const newPosition = center.clone().add(direction.multiplyScalar(-distance))
    
    // 触发相机动画事件
    this.triggerCallback('animateCamera', {
      position: newPosition,
      target: center
    })
  }

  /**
   * 应用悬停效果
   */
  applyHoverEffect(object) {
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        // 保存原始材质
        if (!this.originalMaterials.has(child)) {
          this.originalMaterials.set(child, child.material)
        }
        
        // 应用高亮材质
        child.material = this.highlightMaterial
      }
    })
  }

  /**
   * 移除悬停效果
   */
  removeHoverEffect(object) {
    object.traverse((child) => {
      if (child.isMesh && this.originalMaterials.has(child)) {
        // 恢复原始材质
        child.material = this.originalMaterials.get(child)
      }
    })
  }

  /**
   * 应用选择效果
   */
  applySelectionEffect(object) {
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        // 保存原始材质
        if (!this.originalMaterials.has(child)) {
          this.originalMaterials.set(child, child.material)
        }
        
        // 应用选择材质
        child.material = this.selectedMaterial
      }
    })
  }

  /**
   * 移除选择效果
   */
  removeSelectionEffect(object) {
    object.traverse((child) => {
      if (child.isMesh && this.originalMaterials.has(child)) {
        // 恢复原始材质
        child.material = this.originalMaterials.get(child)
      }
    })
  }

  /**
   * 添加可交互对象
   */
  addInteractiveObject(object) {
    this.interactiveObjects.add(object)
    
    // 为对象添加交互标记
    if (!object.userData) {
      object.userData = {}
    }
    object.userData.interactive = true
  }

  /**
   * 移除可交互对象
   */
  removeInteractiveObject(object) {
    this.interactiveObjects.delete(object)
    
    // 如果当前选中或悬停的是这个对象，清除状态
    if (this.selectedObject === object) {
      this.clearSelection()
    }
    
    if (this.hoveredObject === object) {
      this.clearHover()
    }
  }

  /**
   * 设置交互模式
   */
  setInteractionMode(mode) {
    this.selectMode = mode
  }

  /**
   * 启用/禁用交互
   */
  setInteractionEnabled(enabled) {
    this.interactionEnabled = enabled
    
    if (!enabled) {
      this.clearSelection()
      this.clearHover()
    }
  }

  /**
   * 获取选中对象的信息
   */
  getSelectedObjectInfo() {
    if (!this.selectedObject) return null
    
    const userData = this.selectedObject.userData || {}
    const position = this.selectedObject.position
    
    return {
      name: this.selectedObject.name,
      type: userData.type,
      subtype: userData.subtype,
      position: { x: position.x, y: position.y, z: position.z },
      userData: userData,
      ...userData // 展开用户数据
    }
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
   * 更新射线投射精度
   */
  updateRaycastPrecision(near = 0.1, far = 1000) {
    this.raycaster.near = near
    this.raycaster.far = far
  }

  /**
   * 设置自定义材质
   */
  setHighlightMaterial(material) {
    this.highlightMaterial = material
  }

  setSelectedMaterial(material) {
    this.selectedMaterial = material
  }

  /**
   * 获取交互统计信息
   */
  getInteractionStats() {
    return {
      interactiveObjects: this.interactiveObjects.size,
      selectedObject: this.selectedObject ? this.selectedObject.name : null,
      hoveredObject: this.hoveredObject ? this.hoveredObject.name : null,
      interactionEnabled: this.interactionEnabled,
      selectMode: this.selectMode
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    // 移除事件监听器
    this.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this))
    this.domElement.removeEventListener('click', this.onClick.bind(this))
    this.domElement.removeEventListener('dblclick', this.onDoubleClick.bind(this))
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this))
    
    document.removeEventListener('keydown', this.onKeyDown.bind(this))
    window.removeEventListener('blur', this.onWindowBlur.bind(this))
    
    // 清除状态
    this.clearSelection()
    this.clearHover()
    
    // 恢复所有材质
    this.originalMaterials.forEach((material, mesh) => {
      mesh.material = material
    })
    
    // 清理资源
    this.originalMaterials.clear()
    this.interactiveObjects.clear()
    this.callbacks.clear()
    
    // 清理材质
    this.highlightMaterial.dispose()
    this.selectedMaterial.dispose()
    
    console.log('InteractionSystem disposed')
  }
}