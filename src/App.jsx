import { useState, useEffect } from 'react'
import { CONCEPTS, STARTING_CONCEPT_IDS } from './game/concepts'
import { combine } from './game/combine'
import ConceptBubble from './components/ConceptBubble'
import MyBoards from './components/MyBoards'
import './App.css'

function App() {
  const [discoveredIds, setDiscoveredIds] = useState(STARTING_CONCEPT_IDS)
  const [selectedA, setSelectedA] = useState(null)
  const [selectedB, setSelectedB] = useState(null)
  const [positions, setPositions] = useState({})

  // Generar posiciones aleatorias al iniciar
  useEffect(() => {
    const newPositions = {}
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const radius = 280

    discoveredIds.forEach((id, index) => {
      const angle = (index / discoveredIds.length) * Math.PI * 2
      newPositions[id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })
    setPositions(newPositions)
  }, [discoveredIds])

  const handleConceptClick = (id) => {
    if (!selectedA) {
      setSelectedA(id)
    } else if (!selectedB && id !== selectedA) {
      setSelectedB(id)
    } else {
      setSelectedA(id)
      setSelectedB(null)
    }
  }

  const handleCombine = () => {
    if (!selectedA || !selectedB) return

    const resultId = combine(selectedA, selectedB)
    
    if (resultId && !discoveredIds.includes(resultId)) {
      // Añadir nuevo concepto
      setDiscoveredIds([...discoveredIds, resultId])
      
      // Posicionar el nuevo concepto cerca del centro
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const randomAngle = Math.random() * Math.PI * 2
      const randomRadius = 200 + Math.random() * 100
      
      setPositions({
        ...positions,
        [resultId]: {
          x: centerX + Math.cos(randomAngle) * randomRadius,
          y: centerY + Math.sin(randomAngle) * randomRadius,
        }
      })

      // Mostrar animación de éxito
      setTimeout(() => {
        setSelectedA(null)
        setSelectedB(null)
      }, 500)
    } else if (resultId) {
      // Ya existe, simplemente deseleccionar
      alert('¡Ya descubriste este concepto!')
      setSelectedA(null)
      setSelectedB(null)
    } else {
      // No hay receta
      alert('Esta combinación no funciona')
      setSelectedA(null)
      setSelectedB(null)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          Concepts
          <span className="app-subtitle">Demo</span>
        </h1>
      </header>

      <div className="concepts-area">
        {discoveredIds.map((id) => {
          const concept = CONCEPTS[id]
          const position = positions[id] || { x: 0, y: 0 }
          const isSelected = id === selectedA || id === selectedB

          return (
            <ConceptBubble
              key={id}
              concept={concept}
              position={position}
              onClick={() => handleConceptClick(id)}
              isSelected={isSelected}
            />
          )
        })}
      </div>

      <MyBoards
        discoveredConcepts={discoveredIds.length}
        onCombine={handleCombine}
        selectedA={selectedA ? CONCEPTS[selectedA] : null}
        selectedB={selectedB ? CONCEPTS[selectedB] : null}
      />

      <footer className="app-footer">
        <p>CONCEPTS IS STILL UNDER HEAVY</p>
      </footer>

      {/* Conceptos duplicados en la parte inferior como en la imagen */}
      <div className="bottom-concepts">
        <ConceptBubble
          concept={CONCEPTS.earth}
          position={{ x: '40%', y: '88%' }}
          onClick={() => handleConceptClick('earth')}
          isSelected={selectedA === 'earth' || selectedB === 'earth'}
        />
        <ConceptBubble
          concept={CONCEPTS.air}
          position={{ x: '60%', y: '88%' }}
          onClick={() => handleConceptClick('air')}
          isSelected={selectedA === 'air' || selectedB === 'air'}
        />
      </div>
    </div>
  )
}

export default App