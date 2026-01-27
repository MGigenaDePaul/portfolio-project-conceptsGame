import { useEffect } from 'react'
import './Notification.css'

const Notification = ({
  message,
  isVisible,
  onClose,
  position,
  duration = 2000,
}) => {
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
    <div
      className="notification-container"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="notification">
        <span className="notification-icon">⚠️</span>
        <span className="notification-text">{message}</span>
      </div>
    </div>
  )
}

export default Notification
