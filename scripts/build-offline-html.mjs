import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')
const indexPath = path.join(distDir, 'index.html')

const htmlIn = fs.readFileSync(indexPath, 'utf8')
const assetRef = htmlIn.match(/(?:src|href)="([^"]*?)assets\//)
const base = assetRef?.[1] ?? '/'

function diskPath(url) {
  const clean = url.split(/[?#]/)[0]
  let relative
  if (base !== '/' && clean.startsWith(base)) relative = clean.slice(base.length)
  else if (clean.startsWith('/')) relative = clean.slice(1)
  else relative = clean
  return path.join(distDir, relative)
}

function mimeFor(file) {
  switch (path.extname(file).toLowerCase()) {
    case '.woff2':
      return 'font/woff2'
    case '.woff':
      return 'font/woff'
    case '.ttf':
      return 'font/ttf'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    default:
      return 'application/octet-stream'
  }
}

function inlineCssUrls(css, cssFile) {
  return css.replace(/url\(([^)]+)\)/g, (full, raw) => {
    let spec = raw.trim()
    if ((spec.startsWith('"') && spec.endsWith('"')) || (spec.startsWith("'") && spec.endsWith("'"))) {
      spec = spec.slice(1, -1)
    }
    if (/^(?:data:|https?:|#)/.test(spec)) return full
    const assetUrl = spec.split(/[?#]/)[0]
    const file = assetUrl.startsWith('/') ? diskPath(assetUrl) : path.resolve(path.dirname(cssFile), assetUrl)
    if (!fs.existsSync(file)) {
      throw new Error(`offline HTML is missing CSS asset ${spec} (${file})`)
    }
    const encoded = fs.readFileSync(file).toString('base64')
    return `url("data:${mimeFor(file)};base64,${encoded}")`
  })
}

let html = htmlIn
const cssTags = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]
if (cssTags.length === 0) throw new Error('built index.html has no stylesheet')

let css = ''
for (const tag of cssTags) {
  const href = tag[0].match(/href="([^"]+)"/)?.[1]
  if (!href) throw new Error(`stylesheet tag has no href: ${tag[0]}`)
  const file = diskPath(href)
  css += `${inlineCssUrls(fs.readFileSync(file, 'utf8'), file)}\n`
}

const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g)]
if (scriptTags.length !== 1) {
  throw new Error(`expected one external script in index.html, found ${scriptTags.length}`)
}
const js = fs.readFileSync(diskPath(scriptTags[0][1]), 'utf8')
if (/\bimport\s*(?:\(|["'])/.test(js)) {
  throw new Error('built JavaScript still imports another file, so it cannot be inlined')
}
if (js.includes('</script')) {
  throw new Error('built JavaScript contains a </script> sequence and cannot be inlined safely')
}

function pdfBase64(name) {
  const file = path.join(root, 'public', 'downloads', name)
  if (!fs.existsSync(file)) throw new Error(`missing guide PDF: ${file}`)
  return fs.readFileSync(file).toString('base64')
}

const guides = {
  en: pdfBase64('huth-guide.pdf'),
  zh: pdfBase64('huth-guide.zh.pdf'),
}
const favicon = fs.readFileSync(path.join(root, 'public', 'favicon.svg')).toString('base64')

html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>\s*/g, '')
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>\s*/g, '')
html = html.replace(/<script\b[^>]*\bsrc="[^"]+"[^>]*>\s*<\/script>\s*/g, '')
html = html.replace(
  /<link\b[^>]*rel="icon"[^>]*>/,
  `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${favicon}" />`,
)

if (html.includes('src="') || /rel="stylesheet"/.test(html)) {
  throw new Error('offline HTML still references an external script or stylesheet')
}

html = html.replace('</head>', () => `<style>\n${css}</style>\n</head>`)
html = html.replace('<div id="root"></div>', () => `<div id="root"></div>
<script>
window.__HUTH_OFFLINE_COPY__ = true;
window.__HUTH_GUIDE_PDFS_B64__ = ${JSON.stringify(guides)};
</script>
<script>
${js}
</script>
`)

if (!html.includes(js)) {
  throw new Error('offline HTML did not contain the built JavaScript unchanged')
}

const outDir = path.join(distDir, 'downloads')
fs.mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, 'huth-calculator.html')
fs.writeFileSync(outFile, html)
const bytes = fs.statSync(outFile).size
console.log(`wrote ${path.relative(root, outFile)} (${bytes} bytes)`)
