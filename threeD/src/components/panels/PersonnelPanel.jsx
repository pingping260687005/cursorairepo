import React from 'react'

const PersonnelPanel = () => {
  return (
    <div className="bottom-panel right">
      <div className="panel-header">
        <h3>人员统计</h3>
      </div>
      <div className="personnel-stats">
        <div className="personnel-charts">
          <div className="chart-container">
            <div className="circular-chart">
              <div className="chart-center">
                <span className="chart-value">95%</span>
                <span className="chart-label">在岗率</span>
              </div>
            </div>
            <div className="chart-info">
              <span className="info-label">前端</span>
              <span className="info-value">15 人</span>
            </div>
          </div>
          <div className="chart-container">
            <div className="circular-chart" id="chart2">
              <div className="chart-center">
                <span className="chart-value">86%</span>
                <span className="chart-label">在岗率</span>
              </div>
            </div>
            <div className="chart-info">
              <span className="info-label">后端</span>
              <span className="info-value">2 人</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonnelPanel