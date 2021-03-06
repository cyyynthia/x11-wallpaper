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

declare module '@cyyynthia/x11-wallpaper' {
  export type Wallpaper = {
    width: number
    height: number

    /** Raw RGB pixel data (3 channels) */
    data: Buffer
  }

  export type WallpaperLayout = Record<string, Wallpaper>

  export type Screen = {
    output: string
    x: number
    y: number
    width: number
    height: number
  }

  export type ScreenConfig = {
    /** Total X screen width */
    width: number

    /** Total X screen height */
    height: number

    /** Physical screens layout */
    screens: Screen[]
  }

  /**
   * Gets the currently set wallpaper.
   */
  export function getWallpaper (): Promise<Wallpaper>

  /**
   * Sets the desktop wallpaper.
   * @param wallpaper The wallpaper to set.
   */
  export function setWallpaper (wallpaper: Wallpaper): Promise<void>

  /**
   * Gets the screen configuration.
   * @returns the total size of the X screen, and physical screen layout.
   */
  export function getScreens (): Promise<ScreenConfig>
}
