const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToString } = require('react-dom/server')

// Render the real component at build time and at a later browser time.
// Effects do not run during either initial render, as during hydration.
function initialHtml(timestamp, iphoneInline) {
  const exports = {}
  const RealDate = Date
  class ClockDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [timestamp])) }
  }
  const source = fs.readFileSync(path.join(__dirname, '../app/via-world-clock.tsx'), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText
  vm.runInNewContext(code, { exports, Date: ClockDate, require(name) {
    if (name === 'react' || name === 'react/jsx-runtime') return require(name)
    if (name === './via-live-rates') return { isViaRateStale: () => false }
    if (name === './via-local-settings') return {}
    throw new Error(name)
  } })
  return renderToString(React.createElement(exports.default, { iphoneInline }))
}

for (const iphoneInline of [false, true]) {
  test(`clock hydrates identically across build date and visitor date (inline=${iphoneInline})`, () => {
    const build = initialHtml('2026-10-10T23:59:00Z', iphoneInline)
    const visitor = initialHtml('2026-10-12T09:15:00Z', iphoneInline)
    assert.equal(build, visitor)
    assert.ok(!build.includes('Saturday') && !build.includes('Monday'))
  })
}
