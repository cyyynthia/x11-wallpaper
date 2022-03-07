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
