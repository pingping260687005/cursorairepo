import { SmartParkApp } from './SmartParkApp.js'

/**
 * 应用主入口点
 */
async function main() {
  try {
    console.log('Starting Smart Park 3D Visualization System...')
    
    // 检查浏览器支持
    if (!checkBrowserSupport()) {
      showUnsupportedBrowserMessage()
      return
    }
    
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve)
      })
    }
    
    // 获取3D容器
    const container = document.getElementById('three-container')
    if (!container) {
      throw new Error('3D container not found')
    }
    
    // 创建并启动应用
    window.smartParkApp = new SmartParkApp(container)
    
    // 设置全局错误处理
    setupErrorHandling()
    
    // 设置性能监控
    setupPerformanceMonitoring()
    
    console.log('Smart Park 3D Visualization System started successfully!')
    
  } catch (error) {
    console.error('Failed to start application:', error)
    showErrorMessage('应用启动失败: ' + error.message)
  }
}

/**
 * 检查浏览器支持
 */
function checkBrowserSupport() {
  // 检查WebGL支持
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) {
    console.error('WebGL not supported')
    return false
  }
  
  // 检查ES6模块支持
  if (typeof Symbol === 'undefined') {
    console.error('ES6 not supported')
    return false
  }
  
  return true
}

/**
 * 显示不支持的浏览器消息
 */
function showUnsupportedBrowserMessage() {
  const message = `
    <div style=\"
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    \">
      <h3>浏览器不支持</h3>
      <p>您的浏览器不支持WebGL或现代JavaScript特性。</p>
      <p>请使用最新版本的Chrome、Firefox、Safari或Edge浏览器。</p>
    </div>
  `
  
  document.body.insertAdjacentHTML('beforeend', message)
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 400px;
  `
  
  errorDiv.innerHTML = `
    <h3>应用错误</h3>
    <p>${message}</p>
    <button onclick=\"location.reload()\" style=\"
      margin-top: 10px;
      padding: 8px 16px;
      background: white;
      color: black;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    \">重新加载</button>
  `
  
  document.body.appendChild(errorDiv)
}

/**
 * 设置全局错误处理
 */
function setupErrorHandling() {
  // 捕获未处理的JavaScript错误
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    if (window.smartParkApp && window.smartParkApp.uiManager) {
      window.smartParkApp.uiManager.showNotification(
        'JavaScript错误: ' + event.message,
        'error'
      )
    }
  })
  
  // 捕获未处理的Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    if (window.smartParkApp && window.smartParkApp.uiManager) {
      window.smartParkApp.uiManager.showNotification(
        'Promise错误: ' + (event.reason.message || event.reason),
        'error'
      )
    }
  })
  
  // 捕获WebGL上下文丢失
  document.addEventListener('webglcontextlost', (event) => {
    console.warn('WebGL context lost')
    event.preventDefault()
    
    if (window.smartParkApp && window.smartParkApp.uiManager) {
      window.smartParkApp.uiManager.showNotification(
        'WebGL上下文丢失，正在尝试恢复...',
        'warning'
      )
    }
  })
  
  // WebGL上下文恢复
  document.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored')
    
    if (window.smartParkApp && window.smartParkApp.uiManager) {
      window.smartParkApp.uiManager.showNotification(
        'WebGL上下文已恢复',
        'info'
      )
    }
  })
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitoring() {
  let performanceWarningShown = false
  
  // 监控FPS
  let frameCount = 0
  let lastTime = performance.now()
  
  function checkFPS() {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 5000) { // 每5秒检查一次
      const fps = (frameCount * 1000) / (currentTime - lastTime)
      
      if (fps < 30 && !performanceWarningShown && window.smartParkApp) {
        window.smartParkApp.uiManager.showNotification(
          '检测到性能问题，建议降低渲染质量',
          'warning'
        )
        performanceWarningShown = true
        
        // 自动降低质量
        window.smartParkApp.setRenderQuality('medium')
      }
      
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(checkFPS)
  }
  
  checkFPS()
  
  // 监控内存使用（如果支持）
  if (performance.memory) {
    setInterval(() => {
      const memoryInfo = performance.memory
      const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024)
      const limitMB = memoryInfo.jsHeapSizeLimit / (1024 * 1024)
      
      if (usedMB / limitMB > 0.8) { // 使用超过80%
        console.warn('High memory usage detected:', usedMB.toFixed(1) + 'MB')
      }
    }, 10000) // 每10秒检查一次
  }
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', () => {
  if (window.smartParkApp) {
    window.smartParkApp.dispose()
  }
})

/**
 * 页面可见性变化处理
 */
document.addEventListener('visibilitychange', () => {
  if (window.smartParkApp) {
    if (document.hidden) {
      // 页面隐藏时暂停渲染以节省性能
      window.smartParkApp.sceneManager.pauseRendering()
    } else {
      // 页面显示时恢复渲染
      window.smartParkApp.sceneManager.resumeRendering()
    }
  }
})

/**
 * 调试工具（仅在开发模式下启用）
 */
if (import.meta.env && import.meta.env.MODE === 'development') {
  console.log('Development mode detected, enabling debug tools...')
  
  // 添加调试快捷键
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && window.smartParkApp) {
      switch (event.code) {
        case 'KeyD':
          // Ctrl+Shift+D: 切换调试信息
          console.log('Scene stats:', window.smartParkApp.sceneManager.getSceneStats())
          console.log('Interaction stats:', window.smartParkApp.interactionSystem.getInteractionStats())
          console.log('Data stats:', window.smartParkApp.dataManager.getStats())
          break
          
        case 'KeyE':
          // Ctrl+Shift+E: 导出场景数据
          const sceneData = window.smartParkApp.exportSceneData()
          console.log('Scene data exported:', sceneData)
          break
          
        case 'KeyR':
          // Ctrl+Shift+R: 重置应用
          window.smartParkApp.dispose()
          setTimeout(() => location.reload(), 100)
          break
      }
    }
  })
  
  // 全局调试对象
  window.debugSmartPark = {
    app: () => window.smartParkApp,
    scene: () => window.smartParkApp?.sceneManager,
    camera: () => window.smartParkApp?.cameraController,
    lighting: () => window.smartParkApp?.lightingSystem,
    data: () => window.smartParkApp?.dataManager,
    ui: () => window.smartParkApp?.uiManager,
    interaction: () => window.smartParkApp?.interactionSystem,
    
    // 便捷方法
    setQuality: (level) => window.smartParkApp?.setRenderQuality(level),
    toggleDayNight: () => {
      const lighting = window.smartParkApp?.lightingSystem
      if (lighting) {
        lighting.setDayNightCycle(!lighting.enableDayNightCycle)
      }
    },
    exportData: () => window.smartParkApp?.exportSceneData(),
    stats: () => ({
      scene: window.smartParkApp?.sceneManager.getSceneStats(),
      interaction: window.smartParkApp?.interactionSystem.getInteractionStats(),
      data: window.smartParkApp?.dataManager.getStats()
    })
  }
  
  console.log('Debug tools available at window.debugSmartPark')
}

// 启动应用
main()