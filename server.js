// Production Node.js Server for Ledgerly Web & APK Management
// The server is the persistence layer for APK publishing. Static hosts cannot
// accept runtime uploads, so deploy this process with persistent writable storage.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3000)
const MAX_APK_BYTES = Number(process.env.MAX_APK_BYTES || 250 * 1024 * 1024)
const distDir = path.resolve(__dirname, 'dist')
const publicDir = path.resolve(__dirname, 'public')
const downloadsDir = path.resolve(publicDir, 'downloads')
const releaseJsonPath = path.resolve(publicDir, 'release.json')
fs.mkdirSync(downloadsDir, { recursive: true })

const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.apk': 'application/vnd.android.package-archive' }
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04])

function sendJson(res, statusCode, payload) { res.statusCode = statusCode; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(payload)) }
function emptyRelease() { return { isPublished: false, version: '', fileName: '', downloadUrl: '', fileSize: '', sha256Hash: '', updatedAt: '' } }
function readRelease() { try { if (fs.existsSync(releaseJsonPath)) return JSON.parse(fs.readFileSync(releaseJsonPath, 'utf8')) } catch (error) { console.error('[Server] Could not read release metadata:', error) } return emptyRelease() }
function safeFileName(value, fallback) { const name = path.basename(String(value || fallback)).replace(/[^a-zA-Z0-9._-]/g, '_'); return name.toLowerCase().endsWith('.apk') ? name : `${name}.apk` }
function safeVersion(value) { const version = String(value || '1.0.0').trim().replace(/^v/i, ''); return /^[0-9A-Za-z][0-9A-Za-z._+-]{0,63}$/.test(version) ? version : null }
function formatBytes(bytes) { if (!bytes) return '0 B'; const units = ['B', 'KB', 'MB', 'GB']; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${Number((bytes / 1024 ** index).toFixed(1))} ${units[index]}` }
function removeApkFiles(directory) { if (!fs.existsSync(directory)) return; for (const file of fs.readdirSync(directory)) if (file.toLowerCase().endsWith('.apk')) { try { fs.unlinkSync(path.join(directory, file)) } catch (error) { console.warn(`[Server] Could not remove ${file}:`, error) } } }
function writeRelease(release, directory = publicDir) { const target = path.join(directory, 'release.json'); const temporary = `${target}.tmp-${process.pid}`; fs.writeFileSync(temporary, JSON.stringify(release, null, 2), 'utf8'); fs.renameSync(temporary, target) }
function syncDist(release, buffer) { if (!fs.existsSync(distDir)) return; const distDownloadsDir = path.resolve(distDir, 'downloads'); fs.mkdirSync(distDownloadsDir, { recursive: true }); removeApkFiles(distDownloadsDir); if (release.isPublished) fs.writeFileSync(path.join(distDownloadsDir, release.fileName), buffer); writeRelease(release, distDir) }
function readRequestBody(req) { return new Promise((resolve, reject) => { const chunks = []; let size = 0; let settled = false; req.on('data', (chunk) => { size += chunk.length; if (size > MAX_APK_BYTES) { settled = true; reject(new Error(`APK exceeds the ${formatBytes(MAX_APK_BYTES)} upload limit.`)); req.destroy(); return } chunks.push(chunk) }); req.on('end', () => { if (!settled) resolve(Buffer.concat(chunks)) }); req.on('error', (error) => { if (!settled) reject(error) }) }) }
function validateApkBuffer(buffer, fileName) { if (!fileName.toLowerCase().endsWith('.apk')) return 'The uploaded file must have an .apk extension.'; if (buffer.length === 0) return 'The uploaded APK is empty.'; if (buffer.length < ZIP_MAGIC.length || !buffer.subarray(0, 4).equals(ZIP_MAGIC)) return 'The uploaded file is not a valid Android APK archive.'; return null }

async function handleApi(req, res, parsedUrl) {
  if (parsedUrl.pathname === '/api/apk/current' && req.method === 'GET') { res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate'); sendJson(res, 200, readRelease()); return true }
  if (parsedUrl.pathname === '/api/apk/upload' && req.method === 'POST') {
    const version = safeVersion(parsedUrl.searchParams.get('version'))
    if (!version) { sendJson(res, 400, { success: false, error: 'Invalid version. Use letters, numbers, dots, hyphens, or plus signs.' }); return true }
    const fileName = safeFileName(parsedUrl.searchParams.get('fileName'), `ledgerly-v${version}.apk`)
    try {
      const buffer = await readRequestBody(req)
      const validationError = validateApkBuffer(buffer, fileName)
      if (validationError) { sendJson(res, 400, { success: false, error: validationError }); return true }
      const release = { isPublished: true, version, fileName, downloadUrl: `/downloads/${encodeURIComponent(fileName)}`, fileSize: formatBytes(buffer.length), sha256Hash: crypto.createHash('sha256').update(buffer).digest('hex'), updatedAt: new Date().toISOString() }
      const temporary = path.join(downloadsDir, `.${fileName}.upload-${process.pid}-${Date.now()}`)
      fs.writeFileSync(temporary, buffer)
      removeApkFiles(downloadsDir)
      fs.renameSync(temporary, path.join(downloadsDir, fileName))
      writeRelease(release)
      syncDist(release, buffer)
      console.log(`[Server] Published APK "${fileName}" (v${version}, ${release.fileSize})`)
      sendJson(res, 200, { success: true, release })
    } catch (error) { console.error('[Server] Upload error:', error); sendJson(res, error.message?.includes('upload limit') ? 413 : 500, { success: false, error: error.message || 'Could not publish APK.' }) }
    return true
  }
  if (parsedUrl.pathname === '/api/apk' && req.method === 'DELETE') {
    try { removeApkFiles(downloadsDir); const release = { ...emptyRelease(), updatedAt: new Date().toISOString() }; writeRelease(release); syncDist(release, null); console.log('[Server] Unpublished active APK'); sendJson(res, 200, { success: true, release }) }
    catch (error) { console.error('[Server] Delete error:', error); sendJson(res, 500, { success: false, error: 'Could not remove the published APK.' }) }
    return true
  }
  return false
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = decodeURIComponent(parsedUrl.pathname)
  if (await handleApi(req, res, parsedUrl)) return
  if (pathname.startsWith('/downloads/')) {
    const filename = path.basename(pathname.slice('/downloads/'.length)); const filePath = path.resolve(downloadsDir, filename)
    if (!filename.toLowerCase().endsWith('.apk') || !filePath.startsWith(`${downloadsDir}${path.sep}`) || !fs.existsSync(filePath)) { res.statusCode = 404; res.end('File Not Found'); return }
    res.setHeader('Content-Type', MIME_TYPES['.apk']); res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); res.setHeader('Cache-Control', 'no-cache, must-revalidate'); fs.createReadStream(filePath).pipe(res); return
  }
  if (pathname === '/release.json') { res.setHeader('Cache-Control', 'no-store'); sendJson(res, 200, readRelease()); return }
  const baseServeDir = fs.existsSync(distDir) ? distDir : publicDir; const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''); const filePath = path.resolve(baseServeDir, requestedPath)
  if (filePath.startsWith(`${baseServeDir}${path.sep}`) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) { res.setHeader('Content-Type', MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'); fs.createReadStream(filePath).pipe(res); return }
  const indexPath = path.join(baseServeDir, 'index.html'); if (fs.existsSync(indexPath)) { res.setHeader('Content-Type', MIME_TYPES['.html']); fs.createReadStream(indexPath).pipe(res); return }
  res.statusCode = 404; res.end('Not Found')
})
server.listen(PORT, '0.0.0.0', () => console.log(`Ledgerly server running at http://0.0.0.0:${PORT}`))
