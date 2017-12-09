import assert from 'assert-extended'

import * as server from './helper.server'

describe('Server', () => {
  let client

  beforeEach(() => {
    client = server.createClient()
  })

  it('should run', () =>
    assert.isFulfilled(
      client.getAsync('/')
    )
    .then(data => {
      assert.ok(data)
      assert.ok(data.name)
      assert.ok(data.version)
    })
  )
})
