// @/actions/pagoPdf
"use server"

import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { put } from '@vercel/blob'

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

export async function generarPDFTratamiento(tratamientoId: number): Promise<string> {
  try {
    const isLocal = process.env.CHROME_EXECUTABLE_PATH ? true : false

    const browserConfig = {
      args: isLocal ? [] : [
        ...chromium.args,
        '--no-sandbox',

        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-setuid-sandbox',
        '--mute-audio',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--allow-running-insecure-content',
        '--disable-gpu',
        '--font-render-hinting=none',

        '--disable-dev-shm-usage',
      ],
      executablePath: isLocal
        ? process.env.CHROME_EXECUTABLE_PATH
        : await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar'),
      headless: true,
      ignoreHTTPSErrors: true,
    }

    const browser = await puppeteer.launch(browserConfig)
    const page = await browser.newPage()

    await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/tratamiento-pdf?tratamientoId=${tratamientoId}`, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    })

    // Wait for the content to load completely
    await page.waitForSelector('#tratamiento-pdf')

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    })

    await browser.close()

    // Upload the PDF to Vercel Blob
    const { url } = await put(
      `tratamientos/tratamiento-${tratamientoId}-${Date.now()}.pdf`,
      pdf,
      {
        access: 'public',
        contentType: 'application/pdf',
      }
    )

    return url
  } catch (error) {
    console.error("Error al generar el PDF:", error)
    throw new Error("Error al generar el PDF del tratamiento")
  }
}