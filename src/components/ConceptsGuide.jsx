import { useEffect, useState } from 'react'
import './ConceptsGuide.css'

const ConceptsGuide = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isOpen) {
      setIsClosing(false)
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 800) // 800ms para el cierre
  }

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`guide-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className="guide-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guide-header">
          <h2 className="guide-title">Concepts Guide</h2>
        </div>

        <div className="guide-body">
          <p>Test content - modal is centered!</p>
        </div>
      </div>
    </div>
  )
}

export default ConceptsGuide