import { Eltro as t, assert} from 'eltro'

import * as server from './helper.server.mjs'

t.describe('Server', function() {
  let client

  t.before(function() {
    client = server.createClient()
  })

  t.test('should run', async function() {
    let data = await client.get('/')

    assert.ok(data)
    assert.ok(data.name)
    assert.ok(data.version)
  })

  t.test('should handle errors fine', async function() {
    let data = await assert.isRejected(client.get('/error'))

    assert.ok(data)
    assert.ok(data.body)
    assert.strictEqual(data.body.status, 422)
    assert.match(data.body.message, /test/)
  })
})
