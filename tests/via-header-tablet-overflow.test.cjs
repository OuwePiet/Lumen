const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

test('tablet header constrains navigation and utilities inside the viewport', () => {
  const source = fs.readFileSync('app/via-site-header.tsx', 'utf8')
  const tablet = source.slice(source.indexOf('@media (min-width: 721px) and (max-width: 1100px)'), source.indexOf('@media (max-width: 720px)'))
  assert.match(tablet, /grid-template-columns: 150px minmax\(0, 1fr\)/)
  assert.match(tablet, /\.via-site-header-nav[^}]*overflow-x: auto/s)
  assert.match(tablet, /\.via-site-header-tools[^}]*overflow-x: auto/s)
  assert.match(tablet, /overflow-y: hidden/)
  assert.doesNotMatch(tablet, /overflow:\s*visible/)
})
