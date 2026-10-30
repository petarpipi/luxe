// Renders the app to static HTML after `vite build`, so content and the hero image are
// visible before JavaScript loads. The client then hydrates the same markup.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const server = new URL('../dist/server/entry-server.js', import.meta.url)
const { render } = await import(pathToFileURL(fileURLToPath(server)).href)

const template = await readFile(`${dist}index.html`, 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('Root marker not found in dist/index.html')
await writeFile(`${dist}index.html`, template.replace(marker, `<div id="root">${render()}</div>`))
await rm(`${dist}server`, { recursive: true, force: true })
console.log('Prerendered dist/index.html')
