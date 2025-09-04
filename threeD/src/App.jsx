import React, { useEffect, useRef, useState } from 'react'
import SmartParkScene from './components/SmartParkScene'
import TopNavigation from './components/TopNavigation'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import BottomPanels from './components/BottomPanels'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedObject, setSelectedObject] = useState(null)
  const [parkData, setParkData] = useState({
    buildings: 12,
    sensors: 156,
    onlineDevices: 142,
    alerts: 3,
    energyUsage: 1312
  })

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleObjectSelect = (object) => {
    setSelectedObject(object)
  }

  const handleDataUpdate = (newData) => {
    setParkData(prev => ({ ...prev, ...newData }))
  }

  return (
    <div className="app">
      {isLoading && <LoadingScreen />}
      
      <TopNavigation parkData={parkData} />
      
      <div className="main-content">
        <SmartParkScene 
          onObjectSelect={handleObjectSelect}
          onDataUpdate={handleDataUpdate}
        />
        
        <LeftPanel />
        <RightPanel selectedObject={selectedObject} />
        <BottomPanels />
      </div>
    </div>
  )
}

export default App