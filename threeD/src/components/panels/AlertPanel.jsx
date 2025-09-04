import React from 'react'

const AlertPanel = () => {
  const alerts = [
    { time: '2020.05.03 14:36:31', text: '工业园区6#数据异常，人员数量XXXXX……' },
    { time: '2020.05.03 13:34:45', text: '工业园区设备编号异常，人员数量XXXXXXXXXXXXX…' },
    { time: '2020.05.03 14:36:31', text: '工业园区6#数据异常，人员数量XXXXX……' },
    { time: '2020.05.03 14:36:31', text: '工业园区6#数据异常，人员数量XXXXX……' }
  ]

  return (
    <div className="bottom-panel left">
      <div className="panel-header">
        <h3>告警信息</h3>
      </div>
      <div className="alert-list">
        {alerts.map((alert, index) => (
          <div key={index} className="alert-item">
            <span className="alert-time">{alert.time}</span>
            <span className="alert-text">{alert.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AlertPanel