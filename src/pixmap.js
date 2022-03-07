/*
 * Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export function encode (screen, wallpaper) {
  const depth = screen.depths[screen.root_depth][Object.keys(screen.depths[screen.root_depth])[0]]
  const { red_mask: rmask, green_mask: gmask, blue_mask: bmask } = depth

  const pixmap = Buffer.alloc(wallpaper.width * wallpaper.height * 4)
  for (let y = 0; y < wallpaper.height; y++) {
    for (let x = 0; x < wallpaper.width; x++) {
      const offset = x + wallpaper.width * y
      const pixel = (wallpaper.data[offset * 3])
        | (wallpaper.data[offset * 3 + 1] << 8)
        | (wallpaper.data[offset * 3 + 2] << 16)

      pixmap[(x + wallpaper.width * y) * 4] = (pixel & rmask) >> 16
      pixmap[(x + wallpaper.width * y) * 4 + 1] = (pixel & gmask) >> 8
      pixmap[(x + wallpaper.width * y) * 4 + 2] = (pixel & bmask) >> 0
    }
  }

  return pixmap
}

export function decode (pixmap, width, height) {
  const buffer = Buffer.alloc(width * height * 3)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixmap.readInt32LE((x + width * y) * 4)
      buffer[(x + width * y) * 3] = pixel >> 16
      buffer[(x + width * y) * 3 + 1] = (pixel & 0x00ff00) >> 8
      buffer[(x + width * y) * 3 + 2] = pixel & 0x0000ff
    }
  }

  return buffer
}
