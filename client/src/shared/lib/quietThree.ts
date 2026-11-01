import { setConsoleFunction } from 'three'

// @react-three/fiber 9 still creates a THREE.Clock, which three r183+ warns about on every Canvas.
// Drop only that one message; every other three log still reaches the console.
// ponytail: remove once fiber switches to THREE.Timer (v10).
setConsoleFunction((type: 'log' | 'warn' | 'error', message: string, ...params: unknown[]) => {
  if (message.startsWith('THREE.Clock: This module has been deprecated')) return
  console[type](message, ...params)
})
