import React from 'react'

const WorkspacePanel = () => {
  return (
    <div className="panel-section">
      <div className="section-header">
        <h3>工作台</h3>
      </div>
      <div className="workspace-stats">
        <div className="workspace-item">
          <div className="item-icon online"></div>
          <div className="item-info">
            <span className="item-title">今日预约</span>
            <span className="item-value">141</span>
          </div>
        </div>
        <div className="workspace-item">
          <div className="item-icon chart"></div>
          <div className="item-info">
            <span className="item-title">今日客流</span>
            <span className="item-value">2203</span>
            <div className="mini-chart"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePanel