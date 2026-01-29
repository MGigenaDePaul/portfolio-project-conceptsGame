# 🔧 Guía Rápida de Cambios

## Archivo: App.jsx

### 1. Agregar nuevo estado (línea ~28)

```javascript
// ANTES
const [zIndexes, setZIndexes] = useState({})
const [hitRadius, setHitRadius] = useState(getHitRadius())

// DESPUÉS
const [zIndexes, setZIndexes] = useState({})
const [hitRadius, setHitRadius] = useState(getHitRadius())
const [isCombining, setIsCombining] = useState(false) // ⬅️ NUEVO
```

---

### 2. Modificar onPointerDownBubble (línea ~267)

```javascript
// ANTES
const onPointerDownBubble = (instanceId) => (e) => {
  e.preventDefault()
  e.stopPropagation()
  playPressBubbleSound()

  const p = positions[instanceId]
  if (!p) return

  setDraggingId(instanceId)

  setZIndexes((prev) => ({
    ...prev,
    [instanceId]: zIndexCounter.current++, // ❌ CAMBIAR ESTO
  }))

// DESPUÉS
const onPointerDownBubble = (instanceId) => (e) => {
  // ⬅️ NUEVO: Prevenir interacción durante combinación
  if (isCombining) {
    e.preventDefault()
    e.stopPropagation()
    return
  }

  e.preventDefault()
  e.stopPropagation()
  playPressBubbleSound()

  const p = positions[instanceId]
  if (!p) return

  setDraggingId(instanceId)

  setZIndexes((prev) => ({
    ...prev,
    [instanceId]: 9999, // ⬅️ CAMBIAR: z-index muy alto
  }))
```

---

### 3. Modificar useEffect onMove (línea ~291)

```javascript
// ANTES
if (targetId) {
  // Mantener el dragging element por encima del target
  setZIndexes((prevZ) => ({
    ...prevZ,
    [targetId]: zIndexCounter.current - 1, // ❌ CAMBIAR
    [d.id]: zIndexCounter.current, // ❌ CAMBIAR
  }))
}

// DESPUÉS
if (targetId) {
  setZIndexes((prevZ) => ({
    ...prevZ,
    [targetId]: 100, // ⬅️ CAMBIAR: target más bajo
    [d.id]: 9999, // ⬅️ CAMBIAR: dragging siempre encima
  }))
}
```

---

### 4. Modificar useEffect onUp (línea ~315)

```javascript
// ANTES
setTimeout(() => {
  const combined = combineAndReplace(dragId, targetId, spawnPos)
  if (!combined) {
    playFailSound()
    showNotification('Too complex for demo! Go play in a board!', spawnPos)

    setTimeout(() => {
      setZIndexes((prevZ) => {
        const next = { ...prevZ }
        delete next[dragId]
        delete next[targetId]
        return next
      })
    }, 1500)
  } else {
    setZIndexes((prevZ) => {
      const next = { ...prevZ }
      delete next[dragId]
      delete next[targetId]
      return next
    })
  }
}, 700)

// DESPUÉS
setIsCombining(true) // ⬅️ NUEVO: Lock

setTimeout(() => {
  const combined = combineAndReplace(dragId, targetId, spawnPos)
  if (!combined) {
    playFailSound()
    showNotification('Too complex for demo! Go play in a board!', spawnPos)

    setTimeout(() => {
      setZIndexes((prevZ) => {
        const next = { ...prevZ }
        delete next[dragId]
        delete next[targetId]
        return next
      })
      setIsCombining(false) // ⬅️ NUEVO: Unlock después de notificación
    }, 2000) // ⬅️ CAMBIAR: de 1500 a 2000
  } else {
    setZIndexes((prevZ) => {
      const next = { ...prevZ }
      delete next[dragId]
      delete next[targetId]
      return next
    })
    setIsCombining(false) // ⬅️ NUEVO: Unlock inmediato
  }
}, 700)
```

---

### 5. Actualizar dependencias del useEffect (línea ~350)

```javascript
// ANTES
}, [instances, positions, hitRadius])

// DESPUÉS
}, [instances, positions, hitRadius, isCombining]) // ⬅️ AGREGAR isCombining
```

---

## ⚠️ VERIFICACIÓN IMPORTANTE: ConceptBubble.css

Busca la clase `.concept-bubble.drop-target` y asegúrate de que NO tenga `z-index`:

```css
/* ✅ CORRECTO */
.concept-bubble.drop-target {
  border-color: rgba(139, 92, 246, 0.85);
  box-shadow:
    0 0 0 2px rgba(139, 92, 246, 0.25),
    0 0 30px rgba(139, 92, 246, 0.35),
    0 10px 30px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%) rotate(1deg) scale(1.06);
  /* NO z-index aquí */
}

/* ❌ INCORRECTO - Si ves esto, bórralo */
.concept-bubble.drop-target {
  z-index: 9999; /* ⬅️ ELIMINAR ESTA LÍNEA */
  /* ... resto de estilos ... */
}
```

---

## 📋 Checklist de Implementación

1. [ ] Agregar estado `isCombining`
2. [ ] Modificar `onPointerDownBubble` - agregar check de `isCombining`
3. [ ] Modificar `onPointerDownBubble` - cambiar z-index a 9999
4. [ ] Modificar `onMove` - cambiar z-indexes de target y dragging
5. [ ] Modificar `onUp` - agregar `setIsCombining(true)` antes del setTimeout
6. [ ] Modificar `onUp` - agregar `setIsCombining(false)` en caso de fallo (dentro del segundo setTimeout)
7. [ ] Modificar `onUp` - agregar `setIsCombining(false)` en caso de éxito
8. [ ] Modificar `onUp` - cambiar timeout de 1500 a 2000 en caso de fallo
9. [ ] Actualizar dependencias del useEffect - agregar `isCombining`
10. [ ] Verificar ConceptBubble.css - remover z-index de `.drop-target` si existe

---

## 🧪 Testing

Después de implementar:

1. **Test Bug 1**: Arrastra Fire cerca del botón "?" → Fire debe verse encima
2. **Test Bug 2**: Arrastra Fire sobre Water (sin soltar) → Fire debe verse encima de Water
3. **Test Bug 3**: Combina Fire + Fire (falla) → Trata de arrastrar inmediatamente → No debería permitirte hasta que termine la notificación

---

## 💡 Tips

- Los comentarios con `⬅️` indican las líneas exactas que cambiaron
- Si usas un editor con "Find & Replace", busca los comentarios viejos para encontrar las secciones rápidamente
- Guarda una copia de tu App.jsx actual antes de hacer cambios
- Si algo no funciona, revisa que todas las llaves `{` y `}` estén balanceadas
