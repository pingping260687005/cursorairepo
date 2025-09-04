import React from 'react'
import WorkspacePanel from './panels/WorkspacePanel'
import ManagementPanel from './panels/ManagementPanel'
import StatisticsPanel from './panels/StatisticsPanel'

const LeftPanel = () => {
  return (
    <aside className="left-panel animate-slide-in-left">
      <WorkspacePanel />
      <ManagementPanel />
      <StatisticsPanel />
    </aside>
  )
}

export default LeftPanel