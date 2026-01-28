import { useEffect, useState } from 'react'
import './Notification.css'

const Notification = ({
  message,
  isVisible,
  onClose,
  position,
  duration = 2000,
}) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false)

      const timer = setTimeout(() => {
        // Activar animación de salida
        setIsExiting(true)

        // Esperar que termine la animación antes de cerrar
        setTimeout(() => {
          onClose()
        }, 300) // Duración de la animación fadeOut
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible && !isExiting) return null

  return (
    <div
      className={`notification-container ${isExiting ? 'exiting' : ''}`}
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
