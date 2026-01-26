import { useEffect } from 'react'
import './Notification.css'

const Notification = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  return (
    <div className="notification-container">
      <div className="notification">
        <span className="notification-icon">⚠️</span>
        <span className="notification-text">{message}</span>
      </div>
    </div>
  )
}

export default Notification