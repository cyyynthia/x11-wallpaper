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

import x11 from 'x11'
let cachedRandr = null

async function getRandr (X) {
  if (cachedRandr === null) {
    await new Promise((resolve) => {
      X.require('randr', (err, ext) => {
        cachedRandr = err ? false : ext
        resolve()
      })
    })
  }

  if (cachedRandr === false) throw new Error('RANDR not available')
  return cachedRandr
}

export async function connect () {
  return new Promise((resolve, reject) => {
    x11.createClient((err, display) => {
      if (err) return reject(err)

      // Populate X.atoms with the items we need
      display.client.InternAtom(false, '_XROOTPMAP_ID', (err) => {
        if (err) return reject(err)
        display.client.InternAtom(false, 'ESETROOT_PMAP_ID', (err) => {
          if (err) return reject(err)
          resolve(display.client)
        })
      })
    })
  })
}

export async function getScreens (X) {
  return new Promise((resolve, reject) => {
    getRandr(X).then((randr) => {
      randr.GetScreenResources(X.display.screen[0].root, (err, resources) => {
        if (err) return reject(err)
        const screens = []
        const promises = []
        for (const output of resources.outputs) {
          promises.push(new Promise((resolve, reject) => {
            randr.GetOutputInfo(output, 0, (err, output) => {
              if (err) return reject(err)
              if (output.connection) return resolve()

              randr.GetCrtcInfo(output.crtc, 0, (err, crtc) => {
                if (err) return reject(err)
                screens.push({
                  output: output.name,
                  x: crtc.x,
                  y: crtc.y,
                  width: crtc.width,
                  height: crtc.height,
                })
                resolve()
              })
            })
          }))
        }

        Promise.all(promises).then(() => {
          resolve({
            width: X.display.screen[0].pixel_width,
            height: X.display.screen[0].pixel_height,
            screens: screens,
          })
        })
      })
    })
  })
}
