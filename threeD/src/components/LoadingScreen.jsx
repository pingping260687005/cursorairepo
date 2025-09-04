import React, { useState, useEffect } from 'react'

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('正在加载智慧园区...')

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, message: '初始化3D场景...' },
      { progress: 40, message: '设置相机控制...' },
      { progress: 60, message: '配置光照系统...' },
      { progress: 80, message: '准备3D模型...' },
      { progress: 100, message: '完成!' }
    ]

    let currentStep = 0
    const timer = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress)
        setMessage(loadingSteps[currentStep].message)
        currentStep++
      } else {
        clearInterval(timer)
      }
    }, 400)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner"></div>
        <p>{message}</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen