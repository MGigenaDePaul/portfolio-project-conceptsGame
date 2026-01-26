# Concepts Game 🌍🔥💧🌬️

Un juego interactivo de combinación de elementos inspirado en "Infinite Craft". Combina conceptos básicos para descubrir nuevos elementos.

## 🎮 Características

- **UI Moderna**: Diseño inspirado en la interfaz del juego original
- **Conceptos Flotantes**: Los elementos flotan alrededor del centro de la pantalla
- **Sistema de Combinación**: Combina dos conceptos para crear nuevos
- **Animaciones Suaves**: Transiciones fluidas y efectos visuales
- **Diseño Responsivo**: Adaptado a diferentes tamaños de pantalla

## 🚀 Comenzar

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🎯 Cómo Jugar

1. **Selecciona un concepto**: Haz clic en uno de los elementos flotantes
2. **Selecciona otro concepto**: Haz clic en un segundo elemento diferente
3. **Combina**: Presiona el botón "Combine" en el panel central
4. **Descubre nuevos conceptos**: Si la combinación es válida, aparecerá un nuevo elemento

## 🧩 Combinaciones Disponibles

- 🔥 Fire + 💧 Water = 💨 Steam
- 💧 Water + 🌍 Earth = 🟤 Mud
- 🌬️ Air + 💧 Water = 🌧️ Rain
- 🌬️ Air + 🌍 Earth = 🌫️ Dust
- 🌬️ Air + 🔥 Fire = 🚬 Smoke
- 🌍 Earth + 🔥 Fire = 🌋 Lava

## 📁 Estructura del Proyecto

```
concepts-game/
├── src/
│   ├── components/
│   │   ├── ConceptBubble.jsx      # Componente de burbujas flotantes
│   │   ├── ConceptBubble.css
│   │   ├── MyBoards.jsx            # Panel central
│   │   └── MyBoards.css
│   ├── game/
│   │   ├── concepts.js             # Definición de conceptos
│   │   ├── recipes.js              # Recetas de combinación
│   │   └── combine.js              # Lógica de combinación
│   ├── App.jsx                     # Componente principal
│   ├── App.css
│   ├── main.jsx                    # Punto de entrada
│   └── index.css                   # Estilos globales
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Personalización

### Agregar Nuevos Conceptos

Edita `src/game/concepts.js`:

```javascript
export const CONCEPTS = {
  // ... conceptos existentes
  ocean: { id: 'ocean', name: 'Ocean', emoji: '🌊' },
}
```

### Agregar Nuevas Recetas

Edita `src/game/recipes.js`:

```javascript
export const RECIPES = {
  // ... recetas existentes
  [pairKey('water', 'water')]: 'ocean',
}
```

## 🛠️ Tecnologías

- **React 18** - Librería de UI
- **Vite** - Build tool y dev server
- **CSS3** - Animaciones y efectos visuales

## 📝 Próximas Características

- [ ] Drag & drop para combinar conceptos
- [ ] Sistema de guardado local
- [ ] Más combinaciones y conceptos
- [ ] Efectos de partículas al descubrir nuevos elementos
- [ ] Historial de descubrimientos
- [ ] Modo oscuro/claro
- [ ] Sistema de logros

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍💻 Autor

Miqueas - Concepts Game Demo

---

⭐️ Si te gusta este proyecto, dale una estrella en GitHub!
