import assert from 'assert-extended'
import sinon from 'sinon'

import { createContext } from './helper.server'

describe('Error (Middleware)', () => {
  const error = require('../api/error')

  let ctx

  beforeEach(() => {
    ctx = createContext({ })
  })

  describe('#errorMiddleware()', () => {
    let stub

    beforeEach(() => {
      stub = sinon.stub()
    })

    it('should call next and not do anything if success', async () => {
      await error.errorMiddleware(ctx, stub)

      assert.ok(stub.called)
      assert.strictEqual(ctx.body, undefined)
      assert.strictEqual(ctx.status, undefined)
    })

    it('should support stub throwing', async () => {
      let assertError = new Error('testetytest')
      stub.throws(assertError)

      await error.errorMiddleware(ctx, stub)

      assert.ok(ctx.body)
      assert.strictEqual(ctx.status, 422)
      assert.strictEqual(ctx.body.status, 422)
      assert.strictEqual(ctx.body.message, assertError.message)
    })

    it('should support stub resolving false', async () => {
      let assertError = new Error('herpaderpderp')
      stub.rejects(assertError)

      await error.errorMiddleware(ctx, stub)

      assert.ok(ctx.body)
      assert.strictEqual(ctx.status, 422)
      assert.strictEqual(ctx.body.status, 422)
      assert.strictEqual(ctx.body.message, assertError.message)
    })
  })
})
