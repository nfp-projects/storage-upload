import assert from 'assert-extended'
import sinon from 'sinon'

import { createContext } from '../helper.server'

describe('Media (Security)', () => {
  const security = require('../../api/media/security')
  const jwt = require('../../api/jwt')
  const config = require('../../config')

  let sandbox
  let ctx

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    config.set('sites', {
      test: 'secret',
    })
    ctx = createContext({
      query: {
        token: 'asdf',
      },
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#verifyToken()', () => {
    let stubVerify
    let stubDecode

    beforeEach(() => {
      stubVerify = sandbox.stub(jwt, 'verify')
      stubDecode = sandbox.stub(jwt, 'decode').returns({ site: 1 })
    })

    it('should fail if query token is missing', async () => {
      delete ctx.query.token

      let err = await assert.isRejected(security.verifyToken(ctx))

      assert.ok(err)
      assert.match(err.message, /[tT]oken/)
      assert.match(err.message, /[Mm]issing/)
    })

    it('should fail if token is invalid', async () => {
      const assertToken = 'asdfasdfas'
      ctx.query.token = assertToken
      stubDecode.returns(null)

      let err = await assert.isRejected(security.verifyToken(ctx))

      assert.ok(err)
      assert.ok(stubDecode.called)
      assert.strictEqual(stubDecode.firstCall.args[0], assertToken)
      assert.match(err.message, /[tT]oken/)
      assert.match(err.message, /[Ii]nvalid/)
    })

    it('should fail if token does not have site', async () => {
      stubDecode.returns({ s: 1 })

      let err = await assert.isRejected(security.verifyToken(ctx))

      assert.ok(err)
      assert.ok(stubDecode.called)
      assert.match(err.message, /[tT]oken/)
      assert.match(err.message, /[Ii]nvalid/)
    })

    it('should fail if secret does not match one in config', async () => {
      const assertError = new Error('lethal')
      const assertToken = 'ewgowae'
      ctx.query.token = assertToken
      config.set('sites', { herp: 'derp' })


      stubDecode.returns({ site: 'herp' })
      stubVerify.rejects(assertError)

      let err = await assert.isRejected(security.verifyToken(ctx))

      assert.ok(stubVerify.called)
      assert.strictEqual(err, assertError)
      assert.strictEqual(stubVerify.firstCall.args[0], assertToken)
      assert.strictEqual(stubVerify.firstCall.args[1], 'derp')
    })

    it('should otherwise return the site name', async () => {
      const assertSiteName = 'asdfasdfasdf'
      stubVerify.resolves({ site: assertSiteName })

      let site = await security.verifyToken(ctx)

      assert.strictEqual(site, assertSiteName)
    })
  })
})
