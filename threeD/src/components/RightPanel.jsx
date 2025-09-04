import React from 'react'
import MonitoringPanel from './panels/MonitoringPanel'
import DevicePanel from './panels/DevicePanel'
import MetricsPanel from './panels/MetricsPanel'

const RightPanel = ({ selectedObject }) => {
  return (
    <aside className="right-panel animate-slide-in-right">
      <MonitoringPanel />
      <DevicePanel />
      <MetricsPanel />
      
      {selectedObject && (
        <div className="panel-section animate-fade-in">
          <div className="section-header">
            <h3>选中对象</h3>
          </div>
          <div className="object-details">
            <h4>{selectedObject.name || '未命名对象'}</h4>
            <p>类型: {selectedObject.type || '未知'}</p>
            {selectedObject.status && (
              <p>状态: {selectedObject.status}</p>
            )}
            {selectedObject.energy && (
              <p>能耗: {selectedObject.energy.current} kW</p>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default RightPanel