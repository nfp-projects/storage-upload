import assert from 'assert-extended'
import sinon from 'sinon'

describe('jwt', () => {
  const jsonwebtoken = require('jsonwebtoken')
  const jwt = require('../api/jwt')

  describe('#sign', () => {
    it('should call security correctly', () => {
      let token = jwt.sign({ a: 1 }, 'asdf')
      assert.ok(token)

      let decoded = jsonwebtoken.decode(token)
      assert.strictEqual(decoded.a, 1)
    })

    it('should support custom secret', done => {
      const assertSecret = 'sdfagsda'
      let token = jwt.sign({ a: 1 }, assertSecret)

      jsonwebtoken.verify(token, assertSecret, done)
    })
  })

  describe('#decode()', () => {
    it('should decode correctly', () => {
      let data = { a: 1, b: 2 }
      let token = jwt.sign(data, 'asdf')
      let decoded = jwt.decode(token)

      assert.strictEqual(decoded.a, data.a)
      assert.strictEqual(decoded.b, data.b)
    })
  })

  describe('#verify', () => {
    it('should verify correctly', () => {
      const assertSecret = 'asdfasdf'
      const assertResult = 23532
      let token = jwt.sign({ a: assertResult }, assertSecret)

      return assert.isFulfilled(jwt.verify(token, assertSecret))
        .then(data => assert.strictEqual(data.a, assertResult))
    })

    it('should fail if secret does not match', () => {
      const assertSecret = 'asdfasdf'
      let token = jwt.sign({ a: 1 }, assertSecret)

      return assert.isRejected(jwt.verify(token, assertSecret + 'a'))
        .then(err => assert.match(err.message, /[Ss]ignature/))
    })

    it('should fail token has been mishandled', () => {
      let token = jwt.sign({ a: 1 }, 'asdf')

      return assert.isRejected(jwt.verify(token + 'a', 'asdf'))
        .then(err => assert.match(err.message, /[Ss]ignature/))
    })
  })
})
