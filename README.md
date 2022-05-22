# x11-wallpaper
[![License](https://img.shields.io/github/license/cyyynthia/x11-wallpaper.svg?style=flat-square)](https://github.com/cyyynthia/x11-wallpaper/blob/mistress/LICENSE)
[![npm](https://img.shields.io/npm/v/@cyyynthia/x11-wallpaper?style=flat-square)](https://npm.im/@cyyynthia/x11-wallpaper)

A small NodeJS (ESM only) utility wrapper around [node-x11](https://github.com/sidorares/node-x11) to read/write
the desktop wallpaper on x11.

## Installation
```zsh
[npm | yarn | pnpm] install @cyyynthia/x11-wallpaper
```

## Usage
This library uses the `_XROOTPMAP_ID` and `ESETROOT_PMAP_ID` attributes. It sets them appropriately when updating
the wallpaper, which should ensure compatibility with most other tools.

These examples use [sharp](https://github.com/lovell/sharp) to transform the raw pixel data into images and vice-versa.
This library only speaks raw 3 channels RGB buffers.

### Get current wallpaper
```js
import sharp from 'sharp'
import { getWallpaper } from '@cyyynthia/x11-wallpaper'

const wallpaper = await getWallpaper()
await sharp(wallpaper.data, {
  raw: {
    width: wallpaper.width,
    height: wallpaper.height,
    channels: 3,
  }
}).png().toFile('./output.png')
```

### Set wallpaper
```js
import sharp from 'sharp'
import { getWallpaper } from '@cyyynthia/x11-wallpaper'

const image = await sharp('./cute-cat.png')
  .resize(1920, 1080)
  .removeAlpha()
  .raw()
  .toBuffer()

await setWallpaper({
  width: 1920,
  height: 1080,
  data: image,
})
```

### Get screen configuration
This is a helper method to get the physical screen layout on the X screen. This is useful for multi-screen
configurations, as this library doesn't handle it for you.

```js
import { getScreens } from '@cyyynthia/x11-wallpaper'

const screens = await getScreens()
console.log(screens) // Output of type `ScreenConfig` - See the index.d.ts for more details.
```

#### Multi-screen example usage

##### Set a wallpaper per-screen
```js
import sharp from 'sharp'
import { getScreens, setWallpaper } from '../src/index.js'

// Retrieve screen congfiguration
const screens = await getScreens()

// Create the image
const img = sharp({
  create: {
    width: screens.width,
    height: screens.height,
    channels: 3,
    background: '#000',
  },
})

// Load our wallpapers
const WALLPAPER_PATHS = { outputName: '...', ... } // Output name is the name of the screen (e.g. "DP-0" or "HDMI-0")
const layers = []
for (const screen of screens.screens) {
  layers.push({
    input: await sharp(WALLPAPER_PATHS[screen.output]).resize(screen.width, screen.height).toBuffer(),
    top: screen.y,
    left: screen.x,
  })
}

await setWallpaper({
  width: screens.width,
  height: screens.height,
  data: await img.composite(layers).removeAlpha().raw().toBuffer(),
})
```

##### Get per-screen wallpapers
```js
import sharp from 'sharp'
import { getScreens, getWallpaper } from '../src/index.js'

// Retrieve screen congfiguration
const screens = await getScreens()

// Retrieve & parse wallpaper
const wallpaperRaw = await getWallpaper()
const wallpaper = sharp(wallpaperRaw.data, {
  raw: {
    width: wallpaperRaw.width,
    height: wallpaperRaw.height,
    channels: 3,
  }
})

// Save wallpapers to disk
for (const screen of screens.screens) {
  await wallpaper.clone()
    .extract({ left: screen.x, top: screen.y, width: screen.width, height: screen.height })
    .png().toFile(`wallpaper-${screen.output}.png`)
}
```
