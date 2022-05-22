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

import { connect, getScreens as xGetScreens } from './x.js'
import { encode, decode } from './pixmap.js'

async function getRootPixmapId (X, screen, raw) {
  return new Promise((resolve, reject) => {
    X.GetProperty(0, screen.root, X.atoms._XROOTPMAP_ID, X.atoms.PIXMAP, 0, 4, (err, data) => {
      if (err) return reject(err)
      resolve(raw ? data.data : data.data.readUInt32LE())
    })
  })
}

export async function getWallpaper () {
  const X = await connect()

  const screen = X.display.screen[0]
  const pixmapId = await getRootPixmapId(X, screen)

  return new Promise((resolve, reject) => {
    X.GetGeometry(pixmapId, (err, geo) => {
      if (err) return reject(err)

      X.GetImage(2, pixmapId, 0, 0, geo.width, geo.height, 0xffffffff, (err, pixmap) => {
        if (err) return reject(err)
        resolve({ width: geo.width, height: geo.height, data: decode(pixmap.data, geo.width, geo.height) })
        X.close()
      })
    })
  })
}

export async function setWallpaper (wallpaper) {
  const X = await connect()
  const screen = X.display.screen[0]

  const retainedPixmapId = await getRootPixmapId(X, screen, true)
  X.KillClient(retainedPixmapId) // Free the previously retained pixmap

  // Create Graphics Context
  const gc = X.AllocID()
  X.CreateGC(gc, screen.root)

  // Create Pixmap
  const pixmapId = X.AllocID()
  X.CreatePixmap(pixmapId, screen.root, 24, wallpaper.width, wallpaper.height)

  // Write image
  const pixmap = encode(screen, wallpaper)
  X.PutImage(2, pixmapId, gc, wallpaper.width, wallpaper.height, 0, 0, 0, 24, pixmap)

  // Set wallpaper
  X.ChangeWindowAttributes(screen.root, { backgroundPixmap: pixmapId })
  X.ClearArea(screen.root, 0, 0, 0, 0, 0)

  // Update pixmap reference
  const payload = Buffer.alloc(4)
  payload.writeUInt32LE(pixmapId)
  X.ChangeProperty(0, screen.root, X.atoms._XROOTPMAP_ID, X.atoms.PIXMAP, 32, payload)
  X.ChangeProperty(0, screen.root, X.atoms.ESETROOT_PMAP_ID, X.atoms.PIXMAP, 32, payload)

  // XSetCloseDownMode(RetainTemporary)
  // This is not exposed by node-x11, so here it is hand-crafted.
  X.pack_stream.pack('CCS', [ 112, 2, 1 ])
  X.pack_stream.flush()

  X.close()
}

export async function getScreens () {
  const X = await connect()
  const screens = await xGetScreens(X)
  X.close()
  return screens
}
