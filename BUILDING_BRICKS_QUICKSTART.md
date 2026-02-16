# Building Bricks - Quick Start Guide

## 🎮 5-Minute Quick Start

### Step 1: Open the Application
- Navigate to: `https://barbrickdesign.github.io/buildingBricks.html`
- Or open `buildingBricks.html` in your browser

### Step 2: Splash Screen
You'll see a beautiful animated screen with:
- **"Building Bricks"** logo (gradient purple/pink)
- Subtitle: "Molecular-Level 3D World Builder"
- Big blue **"Enter Worlds"** button

👉 **Click "Enter Worlds"**

---

### Step 3: Choose Your World
You'll see 7 cards in a grid:

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│  ✨     │ │   🌲    │ │   🏙️    │
│ Create  │ │ Forest  │ │  Cyber  │
│   New   │ │         │ │  City   │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│   💎    │ │   ⚛️    │ │   🏜️    │
│Crystal  │ │Quantum  │ │ Desert  │
│ Cavern  │ │   Lab   │ │ Oasis   │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐
│   🌊    │
│ Ocean   │
│ Depths  │
└─────────┘
```

**Recommended for first time**: Choose **🌲 Molecular Forest**

👉 **Click on "Molecular Forest"**

---

### Step 4: Explore the 3D World
The world loads! You'll see:
- Colorful 3D objects (trees, rocks, plants)
- Grid-based layout
- Camera controls active
- UI panels on left and right

---

### Step 5: Gather Resources

#### How to Gather:
1. Make sure **"Explore"** mode is selected (top bar, left side)
2. **Click on any object** in the 3D scene
3. Watch what happens:
   - ✨ Notification appears: "+5 wood" (or whatever resource)
   - 📦 Inventory updates in bottom-left corner
   - 💚 Object health decreases

#### Keep Clicking:
- Click the **same object** multiple times
- Each click extracts more resources
- After 4 clicks (at 0% health):
  - Object fades away
  - You get the full resource yield
  - Object is removed from scene

---

### Step 6: Check Your Inventory
Look at **bottom-left corner** of screen:
```
Camera: (12.0, 8.0, 18.0)
📦 Inventory: wood: 20 | stone: 12
```

This shows all resources you've collected!

---

### Step 7: Inspect Objects (Optional)

Want to see object details?

1. Switch to **"Edit Object"** mode (top bar, middle)
2. Click on any object
3. Right panel shows:
   - Object type (tree, rock, etc.)
   - Position coordinates
   - Health percentage
   - Resource yield amount
   - Current LOD (detail level)

---

### Step 8: Try Different Modes

#### Three Modes Available:

**🔍 Explore Mode** (Default)
- Click objects to gather resources
- Free camera movement
- Resource notifications appear
- Inventory updates in real-time

**🌍 Edit World Mode**
- Modify world-level properties
- Adjust lighting and atmosphere
- Change regional materials
- Experimental features

**🔬 Edit Object Mode**
- Inspect individual objects
- View molecular structure
- See detailed properties
- High-detail rendering forced

---

## 🎯 Pro Tips

### Camera Controls
- **Left Click + Drag**: Rotate camera around scene
- **Right Click + Drag**: Pan camera left/right/up/down
- **Scroll Wheel**: Zoom in/out
- **Double Click**: Center on object (if in edit mode)

### Resource Gathering Strategy
1. Start with **trees** (give most wood)
2. Then **rocks** (for stone)
3. Look for **crystals** (rare, valuable)
4. Each world has different resources!

### Performance Settings
- **Bottom-left panel**: Performance budget slider
  - Low = More point clouds (faster)
  - Balanced = Mix of detail levels
  - High = More high-detail meshes (prettier)

### LOD (Level of Detail)
Objects change appearance based on distance:
- **Far away**: Point cloud (splat)
- **Medium distance**: Simple mesh
- **Close up**: High-detail mesh with subdivisions

Toggle **"Debug LOD"** overlay to see this in action:
- Gray = Splat (far)
- Green = Mesh (medium)
- Blue = High (close)

---

## 🌍 World Recommendations

### For Beginners
👉 **Molecular Forest** 🌲
- Easy to understand (trees = wood)
- High density (lots to interact with)
- Natural theme, intuitive

### For Exploration
👉 **Desert Oasis** 🏜️
- Low density (spread out)
- Rare resources
- Great for learning camera controls

### For Resource Farming
👉 **Crystal Cavern** 💎
- High density
- Valuable resources (crystals, gems)
- Colorful, engaging visuals

### For Aesthetics
👉 **Cyber Metropolis** 🏙️
- Beautiful neon colors
- Urban theme
- Futuristic atmosphere

### For Science Fans
👉 **Quantum Laboratory** ⚛️
- Clean, minimalist design
- Scientific objects (molecules, atoms)
- Low density for careful study

### For Divers
👉 **Ocean Depths** 🌊
- Underwater theme
- Unique resources (coral, shells)
- Beautiful blue palette

---

## 🎨 Customization

### Create Your Own World
1. From gallery, click **"Create New World"** (✨ card)
2. A custom world generates with:
   - Random color palette
   - Medium density
   - Mixed object types
3. Explore and modify as you wish!

### Adjust Settings
**Left Panel** (during gameplay):
- Performance Budget: Low/Balanced/High
- LOD Near Threshold: When high-detail kicks in
- LOD Mid Threshold: When mesh appears

**Right Panel**:
- Prompt input (experimental AI features)
- Selection info (when object selected)
- About section

---

## 🐛 Troubleshooting

### Objects won't respond to clicks
- Make sure you're in **"Explore"** mode (not Edit World or Edit Object)
- Click directly on the colored objects, not empty space
- Camera must be close enough to see objects

### Performance is slow
- Lower **Performance Budget** to "Low"
- Increase **LOD thresholds** (objects will be simpler)
- Close other browser tabs
- Try a world with lower density (Desert Oasis)

### Can't see inventory
- Look at **bottom-left corner** of screen
- It appears after you gather your first resource
- Format: `📦 Inventory: wood: 5 | stone: 2`

### Gallery doesn't appear
- Make sure you clicked **"Enter Worlds"** on splash screen
- Wait 1 second for transition animation
- Refresh page if issue persists

---

## 📱 Mobile Support

The application works on mobile devices:
- **Touch = Click**: Tap objects to interact
- **Touch + Drag**: Rotate camera
- **Pinch**: Zoom in/out
- **Two-finger drag**: Pan camera

**Note**: Mobile performance may be lower. Use "Low" performance setting.

---

## 🚀 Advanced Features

### Object Health System
- Each object has **100% health**
- Each interaction removes **25% health**
- Partial yield per interaction: **~25% of total**
- Full yield when destroyed: **100% of resources**

### Resource Yields by Type
```
Tree     → Wood     (5 units)
Rock     → Stone    (3 units)
Crystal  → Crystal  (2 units)
Mineral  → Mineral  (2 units)
Cactus   → Plant    (3 units)
Coral    → Coral    (2 units)
```

### Polymorphic Rendering
Three representations per object:
1. **Splat Cloud**: 120 colored points
2. **Proxy Mesh**: Simple box geometry
3. **High Mesh**: Subdivided box (6x3x6)

System automatically switches based on:
- Camera distance
- Performance budget
- Edit mode (forces high detail for selected)

---

## 🎯 Goals & Challenges

### Short-term Goals
- [ ] Gather 100 wood
- [ ] Collect 50 stone
- [ ] Find 10 crystals
- [ ] Explore all 6 worlds
- [ ] Destroy 50 objects

### Long-term Goals
- [ ] Gather 1000 of each resource
- [ ] Complete full inventory from each world
- [ ] Master camera controls
- [ ] Understand LOD system
- [ ] Experiment with all modes

---

## 📚 Learn More

- **Full Documentation**: See `BUILDING_BRICKS_README.md`
- **Comparison**: See `BUILDING_BRICKS_COMPARISON.md`
- **Source Code**: Available in `buildingBricks.html`

---

## 💬 Feedback & Support

- **Email**: BarbrickDesign@gmail.com
- **GitHub**: @barbrickdesign
- **Issues**: Submit on GitHub repository

---

**Enjoy building your molecular 3D worlds!** 🚀
