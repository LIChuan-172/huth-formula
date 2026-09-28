/**
 * Render paper/huth-formula.md and paper/huth-formula.zh.md to PDFs.
 *
 * The calculator does not build these in the browser. Run this script, then
 * commit the files it writes under public/paper/ so GitHub Pages can serve them.
 *
 *   npm run paper:pdf
 *
 * Needs Node, Google Chrome, and a Chinese-capable font (Noto Serif CJK SC,
 * Noto Sans CJK SC, WenQuanYi Micro Hei, or Droid Sans Fallback). Math is set
 * with KaTeX; figures are the SVGs linked from each markdown file.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import katex from 'katex'
import MarkdownIt from 'markdown-it'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const paperDir = path.join(root, 'paper')
const outDir = path.join(root, 'public', 'paper')
const chromeCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/local/bin/google-chrome',
].filter(Boolean)

const documents = [
  {
    source: 'huth-formula.md',
    output: 'huth-formula.pdf',
    lang: 'en',
  },
  {
    source: 'huth-formula.zh.md',
    output: 'huth-formula.zh.pdf',
    lang: 'zh-CN',
  },
]

function findChrome() {
  for (const candidate of chromeCandidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  throw new Error('Google Chrome was not found. Set CHROME_PATH to a Chrome binary.')
}

function splitMath(markdown) {
  const parts = []
  let out = ''
  let i = 0
  while (i < markdown.length) {
    if (markdown.startsWith('$$', i)) {
      const end = markdown.indexOf('$$', i + 2)
      if (end === -1) throw new Error('Unclosed display math ($$).')
      parts.push({ display: true, math: markdown.slice(i + 2, end).trim() })
      out += `%%MATH${parts.length - 1}%%`
      i = end + 2
      continue
    }
    if (markdown[i] === '$') {
      let j = i + 1
      let end = -1
      while (j < markdown.length) {
        if (markdown[j] === '\\') {
          j += 2
          continue
        }
        if (markdown[j] === '\n') break
        if (markdown[j] === '$') {
          end = j
          break
        }
        j += 1
      }
      if (end === -1) {
        out += markdown[i]
        i += 1
        continue
      }
      parts.push({ display: false, math: markdown.slice(i + 1, end).trim() })
      out += `%%MATH${parts.length - 1}%%`
      i = end + 1
      continue
    }
    out += markdown[i]
    i += 1
  }
  return { text: out, parts }
}

function slugify(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
}

function renderMath(part) {
  try {
    return katex.renderToString(part.math, {
      displayMode: part.display,
      throwOnError: true,
      strict: 'ignore',
      output: 'htmlAndMathml',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`KaTeX failed on: ${part.math}\n${message}`)
  }
}

function loadSvg(sourcePath, alt) {
  const absolute = path.resolve(paperDir, sourcePath)
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing figure: ${sourcePath}`)
  }
  let svg = fs.readFileSync(absolute, 'utf8')
  svg = svg.replace(/<\?xml[\s\S]*?\?>/, '').replace(/<!DOCTYPE[\s\S]*?>/, '')
  svg = svg.replace(/<svg\b([^>]*)>/, (_, attrs) => {
    const cleaned = attrs.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '')
    return `<svg${cleaned} class="diagram" role="img" aria-label="${alt}">`
  })
  return svg
}

function renderMarkdown(markdown) {
  const { text, parts } = splitMath(markdown)
  const slugCounts = new Map()
  const slugToId = new Map()
  let headingIndex = 0
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false })

  md.renderer.rules.heading_open = (tokens, idx) => {
    const inline = tokens[idx + 1]
    const heading = inline?.children?.map((token) => token.content).join('') ?? ''
    const base = slugify(heading)
    const seen = slugCounts.get(base) ?? 0
    slugCounts.set(base, seen + 1)
    const slug = seen === 0 ? base : `${base}-${seen}`
    headingIndex += 1
    // Short ids stay inside the PDF name-token limit. Percent-encoded Chinese
    // slugs are longer than the 127-byte limit and break some readers.
    const id = `s${headingIndex}`
    slugToId.set(slug, id)
    return `<${tokens[idx].tag} id="${id}">`
  }

  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx]
    const src = token.attrGet('src') ?? ''
    const alt = md.utils.escapeHtml(token.content)
    return `<figure class="diagram-wrap">${loadSvg(src, alt)}</figure>\n`
  }

  let html = md.render(text)
  html = html.replace(/href="#([^"]+)"/g, (_, raw) => {
    const slug = decodeURIComponent(raw)
    const id = slugToId.get(slug)
    if (!id) console.warn(`Unmapped anchor: ${slug}`)
    return id ? `href="#${id}"` : `href="#${raw}"`
  })
  html = html.replace(/href="([^"]+)\.md"/g, 'href="$1.pdf"')
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    html = html.replaceAll(`%%MATH${index}%%`, () => renderMath(parts[index]))
  }
  if (html.includes('%%MATH')) {
    throw new Error('A math placeholder survived markdown rendering.')
  }
  return html
}

function katexCss() {
  const cssPath = path.join(root, 'node_modules', 'katex', 'dist', 'katex.min.css')
  const fontsDir = path.join(root, 'node_modules', 'katex', 'dist', 'fonts')
  const fontUrl = pathToFileURL(fontsDir).href
  return fs.readFileSync(cssPath, 'utf8').replaceAll('url(fonts/', `url(${fontUrl}/`)
}

function documentHtml({ title, lang, body }) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    ${katexCss()}
    @page {
      size: A4;
      margin: 18mm 16mm 16mm;
      @bottom-center {
        content: counter(page);
        font-family: "Liberation Serif", "Noto Serif CJK SC", "WenQuanYi Micro Hei", serif;
        font-size: 9pt;
        color: #5c564c;
      }
    }
    * { box-sizing: border-box; }
    html { color: #1c1915; }
    body {
      margin: 0;
      font-size: 11pt;
      line-height: 1.55;
      font-family: "Liberation Serif", "Noto Serif CJK SC", "WenQuanYi Micro Hei", "Droid Sans Fallback", serif;
    }
    html[lang="zh-CN"] body {
      font-family: "Noto Serif CJK SC", "Source Han Serif SC", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Droid Sans Fallback", "Liberation Serif", serif;
    }
    h1 {
      font-size: 22pt;
      line-height: 1.25;
      font-weight: 650;
      letter-spacing: -0.01em;
      margin: 0 0 0.45em;
    }
    h2 {
      font-size: 15pt;
      line-height: 1.3;
      margin: 1.45em 0 0.45em;
      padding-bottom: 0.15em;
      border-bottom: 1px solid #ddd6cb;
      break-after: avoid;
    }
    h3 {
      font-size: 12.5pt;
      line-height: 1.35;
      margin: 1.15em 0 0.35em;
      break-after: avoid;
    }
    p { margin: 0.55em 0; }
    a { color: #1d4e89; text-decoration: none; }
    ul, ol { margin: 0.4em 0 0.7em; padding-left: 1.35em; }
    li { margin: 0.18em 0; }
    li > p { margin: 0.2em 0; }
    strong { font-weight: 650; }
    code {
      font-family: "Liberation Mono", "Noto Sans Mono CJK SC", "WenQuanYi Micro Hei", monospace;
      font-size: 0.92em;
      background: #f3efe8;
      padding: 0 0.22em;
      border-radius: 0.2em;
    }
    hr {
      border: 0;
      border-top: 1px solid #ddd6cb;
      margin: 1.2em 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8em 0 1em;
      font-size: 10pt;
      line-height: 1.4;
    }
    th, td {
      border: 1px solid #d9d2c7;
      padding: 0.32em 0.55em;
      vertical-align: top;
      text-align: left;
    }
    th { background: #f6f3ee; font-weight: 650; }
    figure.diagram-wrap {
      margin: 0.9em 0 0.4em;
      break-inside: avoid;
      text-align: center;
    }
    figure.diagram-wrap svg.diagram {
      width: 100%;
      height: auto;
      max-height: 150mm;
    }
    .katex { font-size: 1.05em; }
    .katex .text, .katex .mord.text {
      font-family: "Noto Serif CJK SC", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Droid Sans Fallback", "Liberation Serif", serif !important;
    }
    .katex-display {
      margin: 0.75em 0;
      overflow: hidden;
      break-inside: avoid;
    }
    p:has(> em:only-child) {
      color: #3f3a34;
    }
  </style>
</head>
<body>
${body}
<script>
  function fitDisplayMath() {
    for (const block of document.querySelectorAll('.katex-display')) {
      const formula = block.querySelector(':scope > .katex')
      if (!formula) continue
      formula.style.transform = ''
      block.style.height = ''
      const available = block.clientWidth
      const needed = formula.scrollWidth
      if (needed <= available + 1 || available <= 0) continue
      const scale = available / needed
      formula.style.transformOrigin = 'left top'
      formula.style.transform = 'scale(' + scale + ')'
      block.style.height = (formula.offsetHeight * scale) + 'px'
    }
  }
  document.fonts.ready.then(() => {
    fitDisplayMath()
    document.documentElement.dataset.ready = '1'
  })
</script>
</body>
</html>
`
}

function printPdf(chrome, htmlPath, pdfPath) {
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--no-pdf-header-footer',
      '--virtual-time-budget=8000',
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    throw new Error(`Chrome exited with status ${result.status} while writing ${pdfPath}`)
  }
  const bytes = fs.statSync(pdfPath).size
  const header = fs.readFileSync(pdfPath).subarray(0, 5).toString('utf8')
  if (header !== '%PDF-' || bytes < 20_000) {
    throw new Error(`Expected a PDF at ${pdfPath}, got ${bytes} bytes starting with ${JSON.stringify(header)}`)
  }
}

function buildOne(chrome, document, workDir) {
  const markdown = fs.readFileSync(path.join(paperDir, document.source), 'utf8')
  const body = renderMarkdown(markdown)
  const titleMatch = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : document.output
  const htmlPath = path.join(workDir, `${document.output}.html`)
  const pdfPath = path.join(outDir, document.output)
  fs.writeFileSync(htmlPath, documentHtml({ title, lang: document.lang, body }))
  printPdf(chrome, htmlPath, pdfPath)
  console.log(`${document.output}  ${fs.statSync(pdfPath).size} bytes`)
}

const chrome = findChrome()
fs.mkdirSync(outDir, { recursive: true })
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huth-paper-'))
for (const document of documents) buildOne(chrome, document, workDir)
console.log(`Wrote PDFs to ${outDir}`)
