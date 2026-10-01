import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, 'public')
const downloadsDir = path.resolve(publicDir, 'downloads')
const releaseJsonPath = path.resolve(publicDir, 'release.json')

const distDir = path.resolve(__dirname, 'dist')
const distDownloadsDir = path.resolve(distDir, 'downloads')
const distReleaseJsonPath = path.resolve(distDir, 'release.json')

function apkManagerPlugin(): Plugin {
  const handler = async (req: any, res: any, next: any) => {
    // Set CORS headers for all incoming requests so any local/network device can access
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    const parsedUrl = new URL(req.url || '', 'http://localhost')
    const pathname = parsedUrl.pathname

    if (pathname === '/api/apk/current' && req.method === 'GET') {
      try {
        if (fs.existsSync(releaseJsonPath)) {
          const content = fs.readFileSync(releaseJsonPath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.end(content)
          return
        }
      } catch (err) {
        console.error('Error reading release.json:', err)
      }
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ isPublished: false }))
      return
    }

    if (pathname === '/api/apk/upload' && req.method === 'POST') {
      try {
        const version = parsedUrl.searchParams.get('version') || '1.0.0'
        let rawFileName = parsedUrl.searchParams.get('fileName') || `ledgerly-v${version}.apk`
        if (!rawFileName.endsWith('.apk')) rawFileName += '.apk'
        const sanitizedFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_')

        // Receive binary stream
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks)
            if (!sanitizedFileName.toLowerCase().endsWith('.apk') || buffer.length < 4 || !buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'The uploaded file is not a valid Android APK archive.' }))
              return
            }
            const actualFileSize = `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`
            const actualHash = crypto.createHash('sha256').update(buffer).digest('hex')

            // 1. Write to public directory so it persists in the project
            if (!fs.existsSync(downloadsDir)) {
              fs.mkdirSync(downloadsDir, { recursive: true })
            }

            if (fs.existsSync(downloadsDir)) {
              const existingFiles = fs.readdirSync(downloadsDir)
              for (const file of existingFiles) {
                if (file.toLowerCase().endsWith('.apk')) {
                  try {
                    fs.unlinkSync(path.join(downloadsDir, file))
                  } catch (e) {
                    console.warn(`Could not delete previous apk ${file}:`, e)
                  }
                }
              }
            }

            const targetFilePath = path.join(downloadsDir, sanitizedFileName)
            fs.writeFileSync(targetFilePath, buffer)

            const releaseData = {
              isPublished: true,
              version,
              fileName: sanitizedFileName,
              downloadUrl: `/downloads/${sanitizedFileName}`,
              fileSize: actualFileSize,
              sha256Hash: actualHash,
              updatedAt: new Date().toISOString(),
            }

            fs.writeFileSync(releaseJsonPath, JSON.stringify(releaseData, null, 2), 'utf-8')

            // 2. Also sync to dist directory if it exists (for vite preview / built preview)
            if (fs.existsSync(distDir)) {
              if (!fs.existsSync(distDownloadsDir)) {
                fs.mkdirSync(distDownloadsDir, { recursive: true })
              }
              const distFiles = fs.readdirSync(distDownloadsDir)
              for (const file of distFiles) {
                if (file.toLowerCase().endsWith('.apk')) {
                  try {
                    fs.unlinkSync(path.join(distDownloadsDir, file))
                  } catch (e) {
                    console.warn(`Could not delete previous dist apk ${file}:`, e)
                  }
                }
              }
              fs.writeFileSync(path.join(distDownloadsDir, sanitizedFileName), buffer)
              fs.writeFileSync(distReleaseJsonPath, JSON.stringify(releaseData, null, 2), 'utf-8')
            }

            console.log(`[APK Manager] Successfully saved and published APK: ${sanitizedFileName} (v${version})`)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, release: releaseData }))
          } catch (err: any) {
            console.error('Error writing APK to disk:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
        return
      } catch (err: any) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: false, error: err.message }))
        return
      }
    }

    if (pathname === '/api/apk' && req.method === 'DELETE') {
      try {
        // Clean up public
        if (fs.existsSync(downloadsDir)) {
          const existingFiles = fs.readdirSync(downloadsDir)
          for (const file of existingFiles) {
            if (file.toLowerCase().endsWith('.apk')) {
              try {
                fs.unlinkSync(path.join(downloadsDir, file))
              } catch (e) {
                console.warn(`Could not delete apk ${file}:`, e)
              }
            }
          }
        }

        const releaseData = {
          isPublished: false,
          version: '',
          fileName: '',
          downloadUrl: '',
          fileSize: '',
          sha256Hash: '',
          updatedAt: new Date().toISOString(),
        }
        fs.writeFileSync(releaseJsonPath, JSON.stringify(releaseData, null, 2), 'utf-8')

        // Clean up dist if exists
        if (fs.existsSync(distDir) && fs.existsSync(distDownloadsDir)) {
          const distFiles = fs.readdirSync(distDownloadsDir)
          for (const file of distFiles) {
            if (file.toLowerCase().endsWith('.apk')) {
              try {
                fs.unlinkSync(path.join(distDownloadsDir, file))
              } catch (e) {
                console.warn(`Could not delete dist apk ${file}:`, e)
              }
            }
          }
          if (fs.existsSync(distReleaseJsonPath)) {
            fs.writeFileSync(distReleaseJsonPath, JSON.stringify(releaseData, null, 2), 'utf-8')
          }
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true, release: releaseData }))
        return
      } catch (err: any) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: false, error: err.message }))
        return
      }
    }

    next()
  }

  return {
    name: 'apk-manager-plugin',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apkManagerPlugin()],
  base: './',
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) so phones/other devices can connect
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
