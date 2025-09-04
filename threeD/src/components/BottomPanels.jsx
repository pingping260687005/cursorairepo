import React from 'react'
import AlertPanel from './panels/AlertPanel'
import RuntimePanel from './panels/RuntimePanel'
import PersonnelPanel from './panels/PersonnelPanel'

const BottomPanels = () => {
  return (
    <div className="bottom-panels animate-slide-in-up">
      <AlertPanel />
      <RuntimePanel />
      <PersonnelPanel />
    </div>
  )
}

export default BottomPanels