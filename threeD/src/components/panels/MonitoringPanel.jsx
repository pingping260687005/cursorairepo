import React from 'react'

const MonitoringPanel = () => {
  const progressData = [
    { label: '数据一', value: 65, amount: '1024 kW' },
    { label: '数据二', value: 45, amount: '620 kW' },
    { label: '数据三', value: 85, amount: '825 kW' },
    { label: '数据四', value: 35, amount: '634 kW' },
    { label: '数据五', value: 25, amount: '332 kW' }
  ]

  return (
    <div className="panel-section">
      <div className="section-header">
        <h3>数据中心监控</h3>
      </div>
      <div className="monitoring-stats">
        <div className="stat-group">
          <div className="stat-label">用电量</div>
          <div className="stat-value">1312 <span className="unit">kW</span></div>
        </div>
        <div className="stat-group">
          <div className="stat-label">用水量</div>
          <div className="stat-value">1312 <span className="unit">L</span></div>
        </div>
        <div className="stat-group">
          <div className="stat-label">燃气量</div>
          <div className="stat-value">1312 <span className="unit">m³</span></div>
        </div>
        <div className="stat-group">
          <div className="stat-label">传输量</div>
          <div className="stat-value">1312 <span className="unit">t</span></div>
        </div>
        
        <div className="progress-bars">
          {progressData.map((item, index) => (
            <div key={index} className="progress-item">
              <span>{item.label}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.value}%` }}></div>
              </div>
              <span>{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MonitoringPanel