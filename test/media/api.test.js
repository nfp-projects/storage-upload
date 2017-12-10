import fs from 'fs'
import assert from 'assert'
import sinon from 'sinon'
import 'assert-extended'
import appRoot from 'app-root-path'

import createClient from '../helper.client'

describe('Media (API)', () => {
  let config = require('../../config')
  let jwt = require('../../api/jwt')
  let testFile
  let client

  before(() => {
    config.set('sites', {
      development: 'hello-world'
    })
  })

  after(done => {
    if (testFile) {
      return fs.unlink(appRoot.resolve(`/public${testFile}`), done)
    }
    done()
  })

  beforeEach(() => {
    client = createClient()
  })

  describe('POST /media', function temp() {
    this.timeout(10000)

    it('should require authentication', async () => {
      let err = await assert.isRejected(
        client.sendFileAsync('/media',
          appRoot.resolve('/test/media/test.png')))

      assert.strictEqual(err.status, 422)
      assert.match(err.message, /[Tt]oken/)
    })

    it('should upload file and create file', async () => {
      let token = jwt.sign({ site: 'development' }, 'hello-world')

      let data = await assert.isFulfilled(
        client.sendFileAsync(
          `/media?token=${token}`,
          appRoot.resolve('/test/media/test.png')
        )
      )

      assert.ok(data)
      assert.ok(data.filename)
      assert.ok(data.path)

      testFile = data.path
    })
  })
})
