# HyperCraft Performance Optimization Guide

## Overview

HyperCraft has been optimized with lazy loading and device-specific configurations to prevent crashes and ensure smooth gameplay across all devices.

## Device Tier System

The game automatically detects your device capabilities and applies appropriate settings:

### Detection Criteria
- **Screen Resolution**: Higher resolution = better device
- **CPU Cores**: More cores = better device  
- **RAM**: More memory = better device

### Device Tiers

#### Mobile-Ultra-Low (Very Old/Budget Phones)
- **Chunk Size**: 6x6 blocks
- **Render Distance**: 1 chunk
- **Texture Resolution**: 4x4 pixels
- **Max Blocks**: 200
- **Shadows**: Disabled
- **Antialiasing**: Disabled
- **Fog Distance**: 30 units
- **Notes**: Minimal settings for devices with very limited resources

#### Mobile-Low (Old/Budget Phones)
- **Chunk Size**: 8x8 blocks
- **Render Distance**: 2 chunks
- **Texture Resolution**: 8x8 pixels
- **Max Blocks**: 500
- **Shadows**: Disabled
- **Antialiasing**: Disabled
- **Fog Distance**: 50 units

#### Mobile-Mid (Standard Phones)
- **Chunk Size**: 12x12 blocks
- **Render Distance**: 3 chunks
- **Texture Resolution**: 16x16 pixels
- **Max Blocks**: 1,000
- **Shadows**: Disabled
- **Antialiasing**: Disabled
- **Fog Distance**: 100 units

#### Mobile-High (Flagship Phones/Tablets)
- **Chunk Size**: 16x16 blocks
- **Render Distance**: 4 chunks
- **Texture Resolution**: 24x24 pixels
- **Max Blocks**: 2,000
- **Shadows**: Enabled
- **Antialiasing**: Enabled
- **Fog Distance**: 150 units

#### Desktop-Low (Basic Laptops/Old PCs)
- **Chunk Size**: 16x16 blocks
- **Render Distance**: 4 chunks
- **Texture Resolution**: 16x16 pixels
- **Max Blocks**: 2,000
- **Shadows**: Enabled
- **Antialiasing**: Disabled
- **Fog Distance**: 150 units

#### Desktop-Mid (Standard PCs)
- **Chunk Size**: 16x16 blocks
- **Render Distance**: 6 chunks
- **Texture Resolution**: 24x24 pixels
- **Max Blocks**: 4,000
- **Shadows**: Enabled
- **Antialiasing**: Enabled
- **Fog Distance**: 200 units

#### Desktop-High (Gaming PCs)
- **Chunk Size**: 16x16 blocks
- **Render Distance**: 8 chunks
- **Texture Resolution**: 32x32 pixels
- **Max Blocks**: 8,000
- **Shadows**: Enabled
- **Antialiasing**: Enabled
- **Fog Distance**: 250 units

## Progressive Fallback System

### How It Works

When the game fails to load on any device, it doesn't immediately show an error. Instead:

#### Mobile Devices
1. **First Attempt**: Loads with detected device tier (e.g., mobile-mid)
2. **Fallback Attempt 1**: If loading fails, automatically retries with mobile-low settings
3. **Fallback Attempt 2**: If still failing, retries with mobile-ultra-low settings
4. **Final Attempt**: Only after 3 failed attempts with progressively lower settings does it show an error message

#### Desktop Devices
1. **First Attempt**: Loads with detected device tier (e.g., desktop-high)
2. **Fallback Attempt 1**: If loading fails, automatically retries with desktop-mid settings
3. **Fallback Attempt 2**: If still failing, retries with desktop-low settings
4. **Final Attempt**: Only after 3 failed attempts with progressively lower settings does it show an error message

### Benefits

- **No More Doubled Error Messages**: Previous versions could show multiple error states simultaneously
- **Automatic Optimization**: System finds the right performance level for your device
- **Better Mobile Support**: Ultra-low tier supports even very old devices
- **Desktop Fallback**: Even desktop users benefit from progressive degradation
- **User-Friendly**: Handles issues gracefully without confusing error messages
- **Accurate Error Reporting**: Error messages only mention settings that were actually attempted

## Lazy Loading System

### How It Works

1. **Initial Load**: Only generates chunks within render distance of spawn point
2. **Dynamic Loading**: As you move, new chunks load ahead of you
3. **Automatic Unloading**: Chunks beyond render distance + 1 are unloaded to free memory
4. **Update Interval**: Chunks are checked and updated every 1 second

### Benefits

- **Reduced Initial Load Time**: Only generates visible area instead of entire world
- **Lower Memory Usage**: Old system loaded 1,600 blocks at once; new system loads 128-2,048 based on device
- **No More Crashes**: Memory is managed by unloading distant chunks
- **Infinite World**: Can explore indefinitely without memory issues
- **Smooth Performance**: Only renders what's needed

## Performance Monitoring

### HUD Display

The game shows:
- **Device Tier**: Your detected device classification
- **FPS**: Current frames per second
- **Resolution**: Current screen resolution
- **Loaded Blocks**: Total blocks currently in memory
- **Loaded Chunks**: Number of chunks currently loaded

### Console Warnings

If FPS drops below 20, a warning is logged to the console suggesting you may need to reduce render distance.

## Memory Management

### Texture Disposal
When blocks are removed or chunks unloaded:
- Textures are properly disposed
- Materials are released
- Geometry is shared (reused) for efficiency

### Block Limits
Each device tier has a maximum block limit to prevent memory overflow. When reached, no new terrain is generated until space is freed.

## Comparison: Before vs After

### Before Optimization
- Generated 40x40 area (1,600 blocks) at once
- All blocks loaded at full 32x32 texture resolution
- No memory management
- Same settings for all devices
- Game would crash on mobile devices

### After Optimization
- Generates only visible chunks (128-2,048 blocks based on device)
- Adaptive texture resolution (8x8 to 32x32)
- Automatic chunk loading/unloading
- Device-specific configurations
- Smooth performance on all devices

## Troubleshooting

### Game Still Slow?

Check your device tier in the HUD. If classified too high:
- Close other browser tabs
- Restart the browser
- Update your browser to latest version

### Chunks Not Loading?

- Check console for "Max blocks reached" warnings
- Move away from areas with many placed blocks
- The system will automatically unload distant chunks

### Low FPS Warning?

If you see FPS below 20:
- Your device may be classified too high
- Try refreshing the page
- Close other apps/tabs
- Move to areas with fewer blocks

## Technical Details

### Chunk System
- Each chunk is a 8x8, 12x12, or 16x16 grid of blocks (device dependent)
- Chunks are identified by integer coordinates (chunkX, chunkZ)
- A Set tracks which chunks are currently loaded
- A Map stores all block data

### Update Loop
The animation loop:
1. Calculates player's current chunk position
2. Loads chunks within render distance
3. Unloads chunks beyond render distance + 1
4. Updates FPS counter
5. Checks for performance issues

### Texture Generation
Textures are created procedurally with:
- Base color fill
- Noise patterns (stone, dirt, grass)
- Wood grain (for wood blocks)
- Stone cracks and variations
- Detail level scales with device capability

## Future Enhancements

Potential improvements for consideration:
- Dynamic render distance based on FPS
- Chunk caching to disk for faster reloading
- Level-of-detail (LOD) system for distant blocks
- Occlusion culling for hidden blocks
- Web Worker for chunk generation
