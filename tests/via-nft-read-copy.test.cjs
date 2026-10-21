const test = require('node:test'), assert = require('node:assert/strict')
const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript')
const source = fs.readFileSync('lib/via/nft-read-copy.ts', 'utf8')
const exported = {}
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: exported, Intl })
test('Dutch ownership uses current counts and one account name', () => {
  const text = exported.nftReadCopy('Dutch', { username: 'SeWiJuGA', editions: 11365, works: 4296, complete: true })
  assert.match(text, /11\.365/); assert.match(text, /4\.296/)
  assert.equal((text.match(/SeWiJuGA/g) || []).length, 1)
  assert.doesNotMatch(text, /definitieve|loading|owns/)
})
test('every language distinguishes incomplete progress from a final count', () => {
  for (const language of ['Dutch','English','French','Spanish','Chinese','Hindi']) {
    const incomplete = exported.nftReadCopy(language, { editions: 100, works: 24, complete: false })
    const complete = exported.nftReadCopy(language, { editions: 200, works: 48, complete: true })
    assert.notEqual(incomplete, complete)
    assert.match(complete, /200/); assert.match(complete, /48/)
    const progress = exported.nftReadCopy(language, { editions: 300, works: 80, pages: 3 })
    assert.match(progress, /300/); assert.match(progress, /80/)
    if (language !== 'English') assert.doesNotMatch(progress, /Still loading/)
  }
})
