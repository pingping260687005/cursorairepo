import React, { useState, useEffect } from 'react'

const TopNavigation = ({ parkData }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  }

  return (
    <header className="top-nav">
      <div className="logo">
        <h1>智慧园区</h1>
      </div>
      
      <div className="top-stats">
        <div className="stat-item">
          <span className="stat-label">在线设备</span>
          <span className="stat-value">{parkData.onlineDevices}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">告警数量</span>
          <span className="stat-value">{parkData.alerts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">能耗监控</span>
          <span className="stat-value">{parkData.energyUsage} kW</span>
        </div>
      </div>
      
      <div className="datetime">
        <span id="current-time">{formatTime(currentTime)}</span>
      </div>
    </header>
  )
}

export default TopNavigation