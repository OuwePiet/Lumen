const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')
function fixture() {
  const storage = new Map(), events = [], exports = {}
  const window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }, dispatchEvent: event => events.push(event.type) }
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/notification-indicator.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(code, { exports, window, CustomEvent })
  return { api: exports, storage, events, window }
}
test('new notification lights the lamp without an acknowledgement', () => assert.equal(fixture().api.notificationLampIsOn(3, 100, null), true))
test('viewed boundary turns lamp off even if DeSo count remains unchanged', () => assert.equal(fixture().api.notificationLampIsOn(3, 100, 100), false))
test('a newer index lights the lamp even after unread count decreases', () => assert.equal(fixture().api.notificationLampIsOn(1, 101, 100), true))
test('a changed count without a newer notification does not relight the lamp', () => assert.equal(fixture().api.notificationLampIsOn(5, 100, 100), false))
test('zero unread notifications keeps the lamp off', () => assert.equal(fixture().api.notificationLampIsOn(0, 101, 100), false))
test('missing latest index never silently claims positive unread count has been viewed', () => assert.equal(fixture().api.notificationLampIsOn(1, null, 100), true))
test('acknowledgements persist separately for each account', () => { const f=fixture();f.api.acknowledgeNotificationVisit('A',100);assert.equal(f.api.readSeenNotificationIndex('A'),100);assert.equal(f.api.readSeenNotificationIndex('B'),null);assert.deepEqual(f.events,['via:notifications-seen']) })
test('late older visit cannot overwrite a newer acknowledgement', () => { const f=fixture();f.api.acknowledgeNotificationVisit('A',101);f.api.acknowledgeNotificationVisit('A',99);assert.equal(f.api.readSeenNotificationIndex('A'),101) })
test('invalid and corrupt boundaries are not accepted', () => { const f=fixture();for(const value of [-1,NaN,Infinity,1.5,'100'])f.api.acknowledgeNotificationVisit('A',value);assert.equal(f.storage.size,0);f.storage.set(f.api.notificationSeenKey('A'),'broken');assert.equal(f.api.readSeenNotificationIndex('A'),null) })
test('blocked storage cannot fabricate a successful acknowledgement', () => { const f=fixture();f.window.localStorage.setItem=()=>{throw Error('blocked')};f.api.acknowledgeNotificationVisit('A',100);assert.equal(f.events.length,0);assert.equal(f.api.readSeenNotificationIndex('A'),null) })
