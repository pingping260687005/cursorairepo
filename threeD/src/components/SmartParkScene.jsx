import React, { useRef, useEffect } from 'react'
import { SmartParkApp } from '../SmartParkApp'

const SmartParkScene = ({ onObjectSelect, onDataUpdate }) => {
  const mountRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    if (mountRef.current && !appRef.current) {
      try {
        // 创建Three.js应用实例
        appRef.current = new SmartParkApp(mountRef.current)
        
        // 设置回调函数
        if (appRef.current.interactionSystem) {
          appRef.current.interactionSystem.setCallback('objectSelected', (object) => {
            const objectInfo = appRef.current.getObjectDetailedInfo(object)
            onObjectSelect && onObjectSelect(objectInfo)
          })
          
          appRef.current.interactionSystem.setCallback('selectionCleared', () => {
            onObjectSelect && onObjectSelect(null)
          })
        }

        if (appRef.current.dataManager) {
          appRef.current.dataManager.setCallback('dataUpdate', () => {
            const stats = appRef.current.dataManager.getStats()
            onDataUpdate && onDataUpdate(stats)
          })
        }

      } catch (error) {
        console.error('Failed to initialize Smart Park Scene:', error)
      }
    }

    return () => {
      if (appRef.current) {
        appRef.current.dispose()
        appRef.current = null
      }
    }
  }, [onObjectSelect, onDataUpdate])

  return (
    <div 
      ref={mountRef} 
      className="three-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    />
  )
}

export default SmartParkScene