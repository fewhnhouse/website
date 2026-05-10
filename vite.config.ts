import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  const nitroPreset = process.env.VERCEL ? 'vercel' : 'node-server'

  return {
    resolve: { tsconfigPaths: true },
    // Nitro emits a deployable server bundle. On Vercel (`VERCEL` is set at build time)
    // use the `vercel` preset so `.vercel/output` is generated; otherwise Vite’s default
    // `dist/` layout is not wired to Vercel’s routing and every path returns 404.
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      nitro({ preset: nitroPreset }),
    ],
  }
})

export default config
