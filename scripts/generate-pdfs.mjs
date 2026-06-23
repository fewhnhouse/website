// Generates the static CV / home PDFs that the Notes app serves for download.
//
// Why static files instead of an on-demand server route: the site deploys to
// Vercel serverless, where a bundled Chromium cannot launch. We render the print
// routes with Playwright here, commit the resulting PDFs to `public/`, and serve
// them as plain static assets — so the download can never break for a visitor.
//
// Run with `pnpm generate:pdf` after editing cv.mdx / home.mdx.

import { spawn } from 'node:child_process'
import { execSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = 4319
const ORIGIN = `http://localhost:${PORT}`
const DOCUMENTS = ['home', 'cv']

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public')

function pdfFilename(document) {
  return `${document}_felix_wohnhaas.pdf`
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Dev server never became ready at ${url}`)
}

async function launchChromium() {
  const { chromium } = await import('playwright')
  try {
    return await chromium.launch()
  } catch (error) {
    if (!/Executable doesn't exist/.test(String(error))) throw error
    console.log('Chromium not installed for Playwright — installing it now...')
    execSync('pnpm exec playwright install chromium', { cwd: root, stdio: 'inherit' })
    return chromium.launch()
  }
}

const server = spawn('pnpm', ['exec', 'vite', 'dev', '--port', String(PORT)], {
  cwd: root,
  stdio: 'inherit',
})

let browser
try {
  await waitForServer(`${ORIGIN}/notes/cv/print`)
  await mkdir(outDir, { recursive: true })

  browser = await launchChromium()
  for (const document of DOCUMENTS) {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } })
    await page.goto(`${ORIGIN}/notes/${document}/print`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.felix-pdf-mdx')
    await page.emulateMedia({ media: 'print' })
    await page.pdf({
      path: path.join(outDir, pdfFilename(document)),
      format: 'A4',
      margin: { bottom: '18mm', left: '16mm', right: '16mm', top: '18mm' },
      printBackground: false,
    })
    await page.close()
    console.log(`Generated public/${pdfFilename(document)}`)
  }
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
}
