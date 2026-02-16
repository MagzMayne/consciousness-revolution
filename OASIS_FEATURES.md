# Oasis.html Game Features Summary

## Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Health: 100                                     │
│ Score: 0 | Level: 1 | XP: 0/100                 │
│ WASD to move. Click to attack...               │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│                  [3D Universe]                  │
│                                                 │
│                      ╬ ← Crosshair             │
│                                                 │
│         🟥 Enemy                                │
│         ▓▓▓▓▓▓░░░  ← Health bar                │
│                                                 │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Core Gameplay Loop

```
Start Game
    ↓
[Explore 3D World]
    ↓
[Enemies Spawn] → [Click to Attack]
    ↓              ↓
[Take Damage] ← [Defeat Enemy]
    ↓              ↓
[Health = 0?]   [Gain XP & Score]
    ↓              ↓
[Game Over]    [Level Up!]
    ↓              ↓
[Restart] ← ← ← ← ┘
```

## Agent System Architecture

```
┌──────────────┐
│  CoreAgent   │ ← Master brain (RNG, rules)
└──────┬───────┘
       │
   ┌───┴───┬───────────┬──────────┐
   ↓       ↓           ↓          ↓
┌──────┐ ┌─────────┐ ┌──────┐ ┌──────────┐
│World │ │Encounter│ │Player│ │   Scene  │
│Agent │ │ Agent   │ │ Ctrl │ │ Manager  │
└──┬───┘ └────┬────┘ └───┬──┘ └────┬─────┘
   │          │           │         │
   │          │           │         │
   │      ┌───┴────┐      │         │
   │      │ NpcAI  │      │         │
   │      │ (x N)  │      │         │
   │      └────────┘      │         │
   │                      │         │
   └──────────────────────┴─────────┘
                  ↓
           [THREE.js Scene]
```

## Implemented Classes

### 1. SceneManager
- Manages Three.js setup
- Camera, renderer, lights
- Input handling (WASD + click)
- Window resize handling
- Pointer lock for mouse control

### 2. PlayerController
- Position & movement
- Health system (starts at 100, +20 per level)
- Attack system (15 damage, +5 per level)
- XP progression (100 base, 1.5x per level)
- Score tracking
- Level up mechanics

### 3. CoreAgent
- Seed-based RNG (hash function)
- Biome generation (3 types)
- Encounter probability (15% chance)
- Structure placement logic
- Difficulty scaling

### 4. NpcAgent
- Enemy AI (chase player)
- Health system (25 + 5×level)
- Attack behavior (5 + 2×level damage)
- Visual health bars
- Flash on damage
- XP value (10 + 5×level)

### 5. WorldAgent
- Chunk-based terrain (220 unit chunks)
- 3×3 chunk loading radius
- Dynamic loading/unloading
- Procedural props & structures
- Memory efficient

### 6. EncounterAgent
- Spawn timer (3-8 seconds)
- Enemy spawning (1-3 per encounter)
- Combat coordination
- NPC lifecycle management
- Player attack handling

## Game Mechanics Breakdown

### Movement
- **W**: Forward
- **S**: Backward
- **A**: Left
- **D**: Right
- Speed: 20 units/second
- Height: Fixed at 2 units

### Combat
- **Click**: Attack nearest enemy
- Range: 25 units
- Cooldown: 0.5 seconds
- Damage: 15 base (+5 per level)

### Enemy Behavior
- **Chase**: Move toward player at 6+ speed
- **Attack**: Melee range (2.5 units)
- **Cooldown**: 1.3 seconds between attacks
- **Types**: Melee (red) & Ranged (blue)

### Progression
- **Kill Enemy**: +XP (scales with difficulty)
- **Level Up**: +20 max health, +5 attack damage
- **Score**: XP × 10

### World
- **Biomes**: Grassland, Forest, Rocky
- **Props**: Trees, pillars, rocks
- **Structures**: Base + glowing ring
- **Generation**: Deterministic (seed-based)

## HUD Elements

1. **Health**: Current/max health (red when low)
2. **Score**: Total score accumulated
3. **Level**: Current player level
4. **XP**: Progress to next level
5. **Messages**: Real-time game events
6. **Crosshair**: Attack targeting aid

## Game States

### Playing
- All systems active
- Player can move & attack
- Enemies spawn & attack
- HUD updates continuously

### Game Over
- Triggered when health = 0
- Shows final score
- Restart button available
- Scene continues rendering

### Restart
- Resets player stats
- Clears all enemies
- Respawns player at origin
- Resets UI elements

## Key Features

✅ **3D Universe**: Full Three.js implementation
✅ **Procedural Generation**: Infinite terrain
✅ **Enemy AI**: Smart pathfinding & combat
✅ **Combat System**: Click-to-attack mechanics
✅ **Progression**: XP, levels, stats
✅ **Visual Feedback**: Health bars, damage flashes
✅ **Game Loop**: Smooth 60 FPS
✅ **Restart System**: Complete game reset
✅ **HUD**: Real-time stats display
✅ **Crosshair**: Visual aiming aid

## Technical Specifications

- **Engine**: Three.js r160
- **Canvas**: WebGL renderer
- **Camera**: Perspective (75° FOV)
- **Lighting**: Hemisphere + Directional
- **Shadows**: Enabled
- **Anti-aliasing**: Enabled
- **Render Distance**: 3000 units
- **Target FPS**: 60

## Performance Features

- Delta time calculations
- Chunk culling
- Resource disposal
- Efficient prop generation
- Optimized collision detection
- Smart enemy cleanup

## Code Statistics

- **Total Lines**: ~837
- **JavaScript**: ~690 lines
- **Classes**: 6
- **Methods**: 40+
- **Event Handlers**: 5
- **HUD Functions**: 5

## Status: ✅ COMPLETE

All scripts and methods are implemented and functioning. The game is ready to play with:
- Movement system ✓
- Combat system ✓
- AI system ✓
- World generation ✓
- Progression system ✓
- UI/HUD system ✓
- Game state management ✓
- Restart functionality ✓

**Note**: Requires Three.js CDN access or local Three.js library to run.
