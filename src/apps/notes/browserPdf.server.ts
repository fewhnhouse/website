import '@tanstack/react-start/server'

import { chromium } from 'playwright'

import type { NotesDocumentId } from '@/desktop/types'

export async function renderNoteDocumentToPdf(origin: string, document: NotesDocumentId) {
  const browser = await chromium.launch()

  try {
    const page = await browser.newPage({
      viewport: {
        width: 794,
        height: 1123,
      },
    })

    await page.goto(new URL(`/notes/${document}/print`, origin).toString(), {
      waitUntil: 'domcontentloaded',
    })
    await page.waitForSelector('.felix-pdf-mdx')
    await page.emulateMedia({ media: 'print' })

    return await page.pdf({
      format: 'A4',
      margin: {
        bottom: '18mm',
        left: '16mm',
        right: '16mm',
        top: '18mm',
      },
      printBackground: false,
    })
  } finally {
    await browser.close()
  }
}
