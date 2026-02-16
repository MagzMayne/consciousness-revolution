# Building Bricks - Molecular 3D World Builder

An interactive 3D world builder with molecular-level detail, inspired by marble.worldlabs.ai but enhanced with polymorphic rendering and resource gathering mechanics.

## 🌟 Features

### Splash Screen & Gallery
- **Beautiful Entry Point**: Animated splash screen with gradient logo
- **World Gallery**: Browse 6 pre-made themed worlds or create your own
- **Smooth Transitions**: Elegant fade animations between screens

### 6 Themed Worlds

1. **🌲 Molecular Forest**
   - Interactive trees, rocks, and plants
   - Gather wood and stone resources
   - High density environment

2. **🏙️ Cyber Metropolis**
   - Futuristic urban environment
   - Buildings, vehicles, and holograms
   - Cyberpunk aesthetic with neon colors

3. **💎 Crystal Cavern**
   - Underground mineral paradise
   - Mine crystals, minerals, and gems
   - Vibrant, colorful crystals

4. **⚛️ Quantum Laboratory**
   - Scientific research environment
   - Experiment with molecules and atoms
   - Clean, minimalist design

5. **🏜️ Desert Oasis**
   - Vast desert with rare resources
   - Cactus, stone, and artifacts
   - Low density for exploration

6. **🌊 Ocean Depths**
   - Underwater molecular world
   - Coral, shells, and marine minerals
   - Beautiful blue color palette

### Interactive 3D Environment

- **Resource Gathering**: Click objects to harvest materials
  - Trees → Wood
  - Rocks → Stone
  - Crystals → Crystal
  - And more...

- **Health System**: Objects have durability
  - Each interaction reduces object health by 25%
  - Partial resource yield per interaction
  - Full yield when object is destroyed

- **Visual Feedback**:
  - Animated notifications when resources are gained
  - Fade-out animation on object destruction
  - Real-time inventory updates

- **Inventory System**:
  - Track all collected resources
  - Displayed in bottom-left status bar
  - Organized by resource type

### Polymorphic Rendering (Technical)

The system uses three levels of detail (LOD) for each object:

1. **Splat Cloud** (Far distance)
   - Point cloud representation
   - Minimal GPU load
   - Atmospheric effect

2. **Proxy Mesh** (Medium distance)
   - Standard mesh geometry
   - Balanced detail/performance

3. **High-Detail Mesh** (Close distance)
   - Subdivided geometry
   - Enhanced materials
   - Best visual quality

LOD switching happens automatically based on:
- Camera distance
- Performance budget setting
- Edit mode (forces high detail for selected objects)

### Three Interaction Modes

1. **Explore Mode** (Default)
   - Click objects to gather resources
   - Free camera movement
   - Resource notifications

2. **Edit World Mode**
   - World-level adjustments
   - Lighting and atmosphere
   - Regional materials

3. **Edit Object Mode**
   - Object inspection
   - Molecular structure view
   - Property details

## 🎮 How to Use

### Getting Started
1. Open `buildingBricks.html` in a web browser
2. Click "Enter Worlds" on the splash screen
3. Choose a world template or create a new one
4. Start exploring and gathering resources!

### Controls
- **Left Click**: Select/interact with objects
- **Mouse Drag**: Rotate camera
- **Scroll Wheel**: Zoom in/out
- **Right Click**: Pan camera

### Resource Gathering
1. Stay in **Explore Mode** (default)
2. Click on any object in the scene
3. Watch the notification appear (+X resource)
4. Check your inventory in the status bar
5. Continue clicking until object is destroyed

### Object Inspection
1. Switch to **Edit Object Mode** (top bar)
2. Click on an object
3. View details in the right panel:
   - Object type
   - Position coordinates
   - Health percentage
   - Resource yield
   - Current LOD level

## 🛠️ Technical Details

### Technologies Used
- **Three.js**: 3D rendering engine
- **OrbitControls**: Camera control
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Gradients, animations, blur effects

### File Structure
```
buildingBricks.html
├── Splash Screen System
├── World Gallery System
├── World Templates (6 themes)
├── Polymorphic Rendering Classes
│   ├── RenderContext
│   ├── Renderable (base class)
│   └── Brick (interactive object)
├── Three.js Scene Setup
├── UI System
└── Animation Loop
```

### Key Classes

**Brick Class** - Interactive 3D object
- Properties: position, color, type, health, resourceYield
- Methods: interact(), destroy(), render()
- Representations: splatPoints, mesh, highMesh

**RenderContext** - Frame rendering state
- Properties: camera, overlayMode, perfBudget, LOD thresholds
- Used to determine which LOD to display

### Performance Optimization

- **LOD System**: Reduces polygon count for distant objects
- **Performance Budget**: User-adjustable (Low/Balanced/High)
- **Distance Thresholds**: Configurable near/mid/far distances
- **Culling**: Objects outside view are not rendered

## 🎨 Customization

### Adding New Worlds

Edit the `WORLD_TEMPLATES` array in the code:

```javascript
{
  id: 'my-world',
  name: 'My Custom World',
  description: 'Description of your world',
  theme: 'custom',
  tags: ['Tag1', 'Tag2'],
  icon: '🌟',
  config: {
    colors: [
      new THREE.Color('#hexcolor1'),
      new THREE.Color('#hexcolor2'),
      // ... more colors
    ],
    density: 'medium', // 'low', 'medium', or 'high'
    interactiveObjects: ['type1', 'type2', 'type3']
  }
}
```

### Adding New Object Types

Add to the `_getResourceYield()` method in Brick class:

```javascript
const yields = {
  'myobject': { type: 'myresource', amount: 5 },
  // ... existing types
};
```

## 🚀 Future Enhancements

Potential features for future development:

- [ ] Save/Load world state
- [ ] Crafting system (combine resources)
- [ ] Multiplayer support
- [ ] VR/AR mode
- [ ] Advanced terrain generation
- [ ] Weather systems
- [ ] Day/night cycle
- [ ] Sound effects and music
- [ ] Mobile touch controls
- [ ] Export world as 3D model

## 📝 Credits

- **Created by**: Ryan Barbrick (Barbrick Design)
- **AI Assistant**: Merlin AI
- **Inspired by**: marble.worldlabs.ai
- **3D Engine**: Three.js
- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io

## 📧 Contact

- **Email**: BarbrickDesign@gmail.com
- **GitHub**: @barbrickdesign

## 📄 License

Part of the Barbrick Design project collection. See main repository for license details.

---

**Note**: This is a prototype showcasing the polymorphic architecture and interactive world-building concepts. The molecular-level detail mentioned in the problem statement is conceptually represented through the resource gathering system and object interaction mechanics.
