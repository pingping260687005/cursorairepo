/**
 * UI管理器 - 管理2D UI界面和3D场景的交互
 */
export class UIManager {
  constructor() {
    this.panels = new Map()
    this.isInitialized = false
    
    // UI状态
    this.state = {
      currentView: 'overview',
      panelVisible: true,
      selectedObject: null,
      filters: {
        sensors: 'all',
        buildings: 'all'
      }
    }
    
    // 事件回调
    this.callbacks = new Map()
    
    this.init()
  }

  /**
   * 初始化UI管理器
   */
  init() {
    if (this.isInitialized) return
    
    this.setupPanels()
    this.setupEventListeners()
    this.updateStats()
    
    this.isInitialized = true
    console.log('UIManager initialized')
  }

  /**
   * 设置面板引用
   */
  setupPanels() {
    // 控制面板
    this.panels.set('control', {
      element: document.querySelector('.control-panel'),
      header: document.querySelector('.control-panel .panel-header'),
      content: document.querySelector('.control-panel .panel-content'),
      toggle: document.getElementById('panel-toggle')
    })
    
    // 信息面板
    this.panels.set('info', {
      element: document.querySelector('.info-panel'),
      content: document.querySelector('.info-content'),
      defaultInfo: document.getElementById('default-info'),
      objectInfo: document.getElementById('object-info')
    })
    
    // 顶部导航
    this.panels.set('nav', {
      element: document.querySelector('.top-nav'),
      buttons: document.querySelectorAll('.nav-btn')
    })
    
    // 状态栏
    this.panels.set('status', {
      element: document.querySelector('.status-bar'),
      fps: document.getElementById('fps-display'),
      objects: document.getElementById('objects-count'),
      connection: document.getElementById('connection-status'),
      lastUpdate: document.getElementById('last-update')
    })
    
    // 加载屏幕
    this.panels.set('loading', {
      element: document.getElementById('loading-screen'),
      progress: document.getElementById('loading-progress')
    })
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 面板切换
    const controlPanel = this.panels.get('control')
    if (controlPanel.toggle) {
      controlPanel.toggle.addEventListener('click', () => {
        this.toggleControlPanel()
      })
    }
    
    // 导航按钮
    const navPanel = this.panels.get('nav')
    navPanel.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const view = e.target.dataset.view
        this.switchView(view)
      })
    })
    
    // 视角控制按钮
    const viewButtons = document.querySelectorAll('.view-btn')
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset
        this.triggerCallback('viewChange', preset)
      })
    })
    
    // 显示控制复选框
    const displayCheckboxes = document.querySelectorAll('.display-controls input[type=\"checkbox\"]')
    displayCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const type = e.target.id.replace('show-', '')
        const visible = e.target.checked
        this.triggerCallback('displayToggle', { type, visible })
      })
    })
    
    // 筛选器
    const sensorFilter = document.getElementById('sensor-filter')
    if (sensorFilter) {
      sensorFilter.addEventListener('change', (e) => {
        this.state.filters.sensors = e.target.value
        this.triggerCallback('filterChange', { type: 'sensors', value: e.target.value })
      })
    }
    
    const buildingFilter = document.getElementById('building-filter')
    if (buildingFilter) {
      buildingFilter.addEventListener('change', (e) => {
        this.state.filters.buildings = e.target.value
        this.triggerCallback('filterChange', { type: 'buildings', value: e.target.value })
      })
    }
    
    // 场景管理器事件
    document.addEventListener('sceneManager:fpsUpdate', (e) => {
      this.updateFPS(e.detail.fps)
    })
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e)
    })
  }

  /**
   * 切换控制面板显示/隐藏
   */
  toggleControlPanel() {
    const controlPanel = this.panels.get('control')
    const isCollapsed = controlPanel.element.classList.contains('panel-collapsed')
    
    if (isCollapsed) {
      controlPanel.element.classList.remove('panel-collapsed')
      controlPanel.toggle.textContent = '▲'
      this.state.panelVisible = true
    } else {
      controlPanel.element.classList.add('panel-collapsed')
      controlPanel.toggle.textContent = '▼'
      this.state.panelVisible = false
    }
    
    this.triggerCallback('panelToggle', { visible: this.state.panelVisible })
  }

  /**
   * 切换视图
   */
  switchView(viewName) {
    // 更新导航按钮状态
    const navPanel = this.panels.get('nav')
    navPanel.buttons.forEach(button => {
      button.classList.remove('active')
      if (button.dataset.view === viewName) {
        button.classList.add('active')
      }
    })
    
    this.state.currentView = viewName
    this.triggerCallback('viewSwitch', viewName)
  }

  /**
   * 显示对象信息
   */
  showObjectInfo(objectData) {
    const infoPanel = this.panels.get('info')
    
    // 隐藏默认信息
    infoPanel.defaultInfo.style.display = 'none'
    infoPanel.objectInfo.style.display = 'block'
    
    // 生成对象信息HTML
    const infoHTML = this.generateObjectInfoHTML(objectData)
    infoPanel.objectInfo.innerHTML = infoHTML
    
    this.state.selectedObject = objectData
  }

  /**
   * 隐藏对象信息
   */
  hideObjectInfo() {
    const infoPanel = this.panels.get('info')
    
    infoPanel.defaultInfo.style.display = 'block'
    infoPanel.objectInfo.style.display = 'none'
    
    this.state.selectedObject = null
  }

  /**
   * 生成对象信息HTML
   */
  generateObjectInfoHTML(objectData) {
    let html = `<h4>${objectData.name || '未知对象'}</h4>`
    
    switch (objectData.type) {
      case 'building':
        html += `
          <div class="object-details">
            <div class="detail-item">
              <span class="label">类型:</span>
              <span class="value">${objectData.subtype || '建筑物'}</span>
            </div>
            <div class="detail-item">
              <span class="label">尺寸:</span>
              <span class="value">${objectData.width}×${objectData.height}×${objectData.depth}m</span>
            </div>
            <div class="detail-item">
              <span class="label">使用率:</span>
              <span class="value">${objectData.occupancy?.toFixed(1) || 0}%</span>
            </div>
            <div class="detail-item">
              <span class="label">能耗:</span>
              <span class="value">${objectData.energy?.toFixed(0) || 0} kW</span>
            </div>
          </div>
        `
        break
        
      case 'sensor':
        html += `
          <div class="object-details">
            <div class="detail-item">
              <span class="label">传感器类型:</span>
              <span class="value">${this.getSensorTypeLabel(objectData.subtype)}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <span class="value status-${objectData.status}">${this.getStatusLabel(objectData.status)}</span>
            </div>
            <div class="detail-item">
              <span class="label">当前值:</span>
              <span class="value">${objectData.value?.toFixed(2) || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后更新:</span>
              <span class="value">${new Date(objectData.lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>
        `
        break
        
      case 'vehicle':
        html += `
          <div class="object-details">
            <div class="detail-item">
              <span class="label">车辆类型:</span>
              <span class="value">${objectData.subtype || '车辆'}</span>
            </div>
            <div class="detail-item">
              <span class="label">速度:</span>
              <span class="value">${objectData.speed?.toFixed(1) || 0} km/h</span>
            </div>
            <div class="detail-item">
              <span class="label">方向:</span>
              <span class="value">${objectData.direction?.toFixed(0) || 0}°</span>
            </div>
          </div>
        `
        break
        
      default:
        html += `<div class="object-details"><p>暂无详细信息</p></div>`
    }
    
    return html
  }

  /**
   * 获取传感器类型标签
   */
  getSensorTypeLabel(type) {
    const labels = {
      'temperature': '温度传感器',
      'humidity': '湿度传感器',
      'air_quality': '空气质量传感器',
      'motion': '运动传感器',
      'sound': '声音传感器'
    }
    return labels[type] || type
  }

  /**
   * 获取状态标签
   */
  getStatusLabel(status) {
    const labels = {
      'normal': '正常',
      'warning': '警告',
      'error': '错误',
      'offline': '离线'
    }
    return labels[status] || status
  }

  /**
   * 更新FPS显示
   */
  updateFPS(fps) {
    const statusPanel = this.panels.get('status')
    if (statusPanel.fps) {
      statusPanel.fps.textContent = `FPS: ${fps}`
    }
  }

  /**
   * 更新对象计数
   */
  updateObjectCount(count) {
    const statusPanel = this.panels.get('status')
    if (statusPanel.objects) {
      statusPanel.objects.textContent = `对象: ${count}`
    }
  }

  /**
   * 更新统计信息
   */
  updateStats(stats = {}) {
    // 更新默认信息面板的统计数据
    const defaultInfo = document.getElementById('default-info')
    if (defaultInfo) {
      const statItems = defaultInfo.querySelectorAll('.stat-value')
      
      if (statItems.length >= 4) {
        statItems[0].textContent = stats.buildings || '12'
        statItems[1].textContent = stats.sensors || '156'
        statItems[2].textContent = stats.onlineDevices || '142'
        statItems[3].textContent = stats.alerts || '3'
      }
    }
    
    // 更新状态栏
    this.updateConnectionStatus(stats.connected !== false)
    this.updateLastUpdate()
  }

  /**
   * 更新连接状态
   */
  updateConnectionStatus(connected) {
    const statusPanel = this.panels.get('status')
    if (statusPanel.connection) {
      statusPanel.connection.textContent = `连接状态: ${connected ? '已连接' : '断开连接'}`
      statusPanel.connection.style.color = connected ? '#00ff00' : '#ff0000'
    }
  }

  /**
   * 更新最后更新时间
   */
  updateLastUpdate() {
    const statusPanel = this.panels.get('status')
    if (statusPanel.lastUpdate) {
      statusPanel.lastUpdate.textContent = `最后更新: ${new Date().toLocaleTimeString()}`
    }
  }

  /**
   * 显示加载屏幕
   */
  showLoading() {
    const loadingPanel = this.panels.get('loading')
    if (loadingPanel.element) {
      loadingPanel.element.classList.remove('hidden')
    }
  }

  /**
   * 隐藏加载屏幕
   */
  hideLoading() {
    const loadingPanel = this.panels.get('loading')
    if (loadingPanel.element) {
      loadingPanel.element.classList.add('hidden')
    }
  }

  /**
   * 更新加载进度
   */
  updateLoadingProgress(progress) {
    const loadingPanel = this.panels.get('loading')
    if (loadingPanel.progress) {
      loadingPanel.progress.style.width = `${progress}%`
    }
  }

  /**
   * 显示通知
   */
  showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    
    // 样式
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : type === 'warning' ? '#ff8800' : '#0088ff'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    // 显示动画
    setTimeout(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateX(0)'
    }, 10)
    
    // 自动隐藏
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, duration)
  }

  /**
   * 处理键盘事件
   */
  handleKeyboard(event) {
    switch (event.code) {
      case 'Tab':
        event.preventDefault()
        this.toggleControlPanel()
        break
        
      case 'Escape':
        this.hideObjectInfo()
        break
        
      case 'KeyF':
        if (event.ctrlKey) {
          event.preventDefault()
          // 全屏模式切换
          this.triggerCallback('toggleFullscreen')
        }
        break
        
      case 'KeyR':
        if (event.ctrlKey) {
          event.preventDefault()
          // 重置视角
          this.triggerCallback('resetView')
        }
        break
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
   * 设置显示设置
   */
  setDisplaySetting(type, value) {
    const checkbox = document.getElementById(`show-${type}`)
    if (checkbox) {
      checkbox.checked = value
    }
  }

  /**
   * 设置筛选器值
   */
  setFilterValue(type, value) {
    const filter = document.getElementById(`${type}-filter`)
    if (filter) {
      filter.value = value
      this.state.filters[type] = value
    }
  }

  /**
   * 获取当前UI状态
   */
  getState() {
    return { ...this.state }
  }

  /**
   * 设置UI状态
   */
  setState(newState) {
    Object.assign(this.state, newState)
    
    // 更新UI以反映状态变化
    if (newState.currentView) {
      this.switchView(newState.currentView)
    }
    
    if (newState.panelVisible !== undefined) {
      const controlPanel = this.panels.get('control')
      if (newState.panelVisible) {
        controlPanel.element.classList.remove('panel-collapsed')
        controlPanel.toggle.textContent = '▲'
      } else {
        controlPanel.element.classList.add('panel-collapsed')
        controlPanel.toggle.textContent = '▼'
      }
    }
  }

  /**
   * 启用/禁用UI
   */
  setEnabled(enabled) {
    const panels = ['control', 'info', 'nav']
    
    panels.forEach(panelName => {
      const panel = this.panels.get(panelName)
      if (panel && panel.element) {
        panel.element.style.pointerEvents = enabled ? 'auto' : 'none'
        panel.element.style.opacity = enabled ? '1' : '0.5'
      }
    })
  }

  /**
   * 清理资源
   */
  dispose() {
    // 移除事件监听器
    document.removeEventListener('keydown', this.handleKeyboard.bind(this))
    document.removeEventListener('sceneManager:fpsUpdate', () => {})
    
    // 清理回调
    this.callbacks.clear()
    
    // 清理面板引用
    this.panels.clear()
    
    console.log('UIManager disposed')
  }
}