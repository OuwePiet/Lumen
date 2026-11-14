const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const exportsObject = {}
const source = fs.readFileSync(path.join(__dirname, '../app/nft-media.tsx'), 'utf8')
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText,
  { exports: exportsObject, require, URL })
test('native NFT media distinguishes images, video, audio and document files', () => {
  for (const [file, kind] of [['art.png','image'],['film.mp4','video'],['song.mp3','audio'],['book.pdf','file'],['archive.zip','file'],['model.glb','file']]) {
    assert.equal(exportsObject.buildCandidates('https://creator.example/'+file+'?version=2')[0].kind, kind)
  }
})
test('IPFS retains the same content path through two distinct gateways', () => {
  const items = exportsObject.buildCandidates('ipfs://bafyexample/book.pdf')
  assert.equal(items.length, 2)
  assert.notEqual(new URL(items[0].url).hostname, new URL(items[1].url).hostname)
  assert.ok(items.every(item => item.url.endsWith('/ipfs/bafyexample/book.pdf') && item.kind === 'file'))
})
test('NFT media rejects executable URLs, plaintext URLs and embedded credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://creator.example/file.pdf', 'https://user:password@creator.example/file.pdf', 'ipfs://cid/../private']) {
    assert.equal(exportsObject.buildCandidates(url).length, 0)
  }
})
test('documents open as a safe external file link without an iframe', () => {
  const html = renderToStaticMarkup(React.createElement(exportsObject.default, { imageUrl: 'https://creator.example/book.pdf', alt: 'NFT book', imageStyle: {}, placeholderStyle: {} }))
  assert.match(html, /Open oorspronkelijk bestand/)
  assert.match(html, /rel="noopener noreferrer"/)
  assert.doesNotMatch(html, /<iframe|<img/)
})
test('sensitive files require explicit reveal before offering a file link', () => {
  const html = renderToStaticMarkup(React.createElement(exportsObject.default, { imageUrl: 'https://creator.example/book.pdf', alt: 'NFT book', sensitive: true, imageStyle: {}, placeholderStyle: {} }))
  assert.match(html, /Toon gevoelige inhoud/)
  assert.doesNotMatch(html, /href=/)
})
