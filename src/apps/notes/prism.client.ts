import '@tanstack/react-start/client-only'

import Prism from 'prismjs'

declare global {
  interface Window {
    Prism: typeof Prism
  }
}

const globalScope = globalThis as typeof globalThis & { Prism?: typeof Prism }

globalScope.Prism = Prism

if (typeof window !== 'undefined') {
  window.Prism = Prism
}
