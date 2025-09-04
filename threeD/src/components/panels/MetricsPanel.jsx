import React from 'react'

const MetricsPanel = () => {
  const metricsData = [
    { label: '前端', value: '132.4', unit: 'TB', change: '+8.4' },
    { label: '后端', value: '132.4', unit: 'TB', change: '+6.4' },
    { label: '空间', value: '8.4', unit: 'TB', change: '+2.3' },
    { label: '3174', value: '2.3', unit: 'TB', change: '+2.3' }
  ]

  return (
    <div className="panel-section">
      <div className="section-header">
        <h3>设备计数</h3>
      </div>
      <div className="device-charts">
        {metricsData.map((item, index) => (
          <div key={index} className="chart-item">
            <div className="chart-label">{item.label}</div>
            <div className="chart-value">{item.value} <span className="unit">{item.unit}</span></div>
            <div className="chart-change">{item.change}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MetricsPanel