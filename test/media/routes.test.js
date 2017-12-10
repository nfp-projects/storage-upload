import assert from 'assert-extended'
import sinon from 'sinon'

import { createContext } from '../helper.server'

describe('Media (Routes)', () => {
  const multer = require('../../api/media/multer')
  const routes = require('../../api/media/routes')
  const security = require('../../api/media/security')
  const config = require('../../config')

  let sandbox
  let ctx

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    ctx = createContext({
      req: {
        file: { },
      },
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#upload', () => {
    let stubVerifyToken
    let stubUpload

    beforeEach(() => {
      stubVerifyToken = sandbox.stub(security, 'verifyToken')
      stubUpload = sandbox.stub(multer, 'uploadFile').resolves({})
    })

    it('should call security correctly', async () => {
      const assertError = new Error('temp')
      stubVerifyToken.rejects(assertError)

      let err = await assert.isRejected(routes.upload(ctx))

      assert.ok(stubVerifyToken.called)
      assert.strictEqual(err, assertError)
      assert.strictEqual(stubVerifyToken.firstCall.args[0], ctx)
    })

    it('should call upload correctly', async () => {
      const assertSiteName = 'benshapiro'
      const assertError = new Error('hello')
      stubVerifyToken.resolves(assertSiteName)
      stubUpload.rejects(assertError)

      let err = await assert.isRejected(routes.upload(ctx))

      assert.ok(stubUpload.called)
      assert.strictEqual(err, assertError)
      assert.strictEqual(stubUpload.firstCall.args[0], ctx)
      assert.strictEqual(stubUpload.firstCall.args[1], assertSiteName)
    })

    it('should otherwise set context status to 204 and file in result', async () => {
      const assertFilename = 'asdfsafd'
      const assertSite = 'mario'
      stubVerifyToken.resolves(assertSite)
      stubUpload.resolves({ filename: assertFilename })
      await routes.upload(ctx)

      assert.strictEqual(ctx.body.filename, assertFilename)
      assert.strictEqual(ctx.body.path, `/${assertSite}/${assertFilename}`)
    })
  })
})
