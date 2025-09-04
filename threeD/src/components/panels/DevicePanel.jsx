import React from 'react'

const DevicePanel = () => {
  return (
    <div className="panel-section">
      <div className="section-header">
        <h3>设备设置</h3>
      </div>
      <div className="device-status">
        <div className="device-item">
          <span className="device-name">在线</span>
          <span className="device-count">83</span>
          <span className="device-name">离线</span>
          <span className="device-count">23</span>
        </div>
      </div>
    </div>
  )
}

export default DevicePanel