import assert from 'assert-extended'
import sinon from 'sinon'

describe('defaults', () => {
  const defaults = require('../api/defaults').default

  describe('#defaults()', () => {
    it('should apply defaults to flat objects', () => {
      let assertOutput = { a: 1 }
      let output = defaults(null, { a: 1 })

      assert.deepEqual(output, assertOutput)
    })

    it('should allow overriding defult properties', () => {
      let assertOutput = { a: 2 }
      let output = defaults(assertOutput, { a: 1 })

      assert.deepEqual(output, assertOutput)
    })

    it('should allow nesting through objects', () => {
      let def = { a: { b: 2 } }
      let output = defaults({ a: { c: 3} }, def)

      assert.deepEqual(output.a, {
        b: 2,
        c: 3,
      })
    })
  })
})
