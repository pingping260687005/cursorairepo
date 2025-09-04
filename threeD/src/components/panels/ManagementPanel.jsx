import React from 'react'

const ManagementPanel = () => {
  const managementItems = [
    '《公园园区系统运行》',
    '《设备状态 × × × × × ×》',
    '《设备电源 × × × × × × ×》',
    '《设备控制 × × × × × × ×》',
    '《设备监控 × × × × × × ×》'
  ]

  return (
    <div className="panel-section">
      <div className="section-header">
        <h3>配行管理</h3>
      </div>
      <div className="management-list">
        {managementItems.map((item, index) => (
          <div key={index} className="management-item">
            <span className="status-dot active"></span>
            <span className="item-text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManagementPanel