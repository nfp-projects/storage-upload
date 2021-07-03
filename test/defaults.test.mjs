import { Eltro as t, assert} from 'eltro'
import defaults from '../api/defaults.mjs'

t.describe('#defaults()', () => {
  t.test('should apply defaults to flat objects', () => {
    let assertOutput = { a: 1 }
    let output = defaults(null, { a: 1 })

    assert.deepStrictEqual(output, assertOutput)
    output = defaults({ a: 1 })

    assert.deepStrictEqual(output, assertOutput)
  })

  t.test('should allow overriding defult properties', () => {
    let assertOutput = { a: 2 }
    let output = defaults(assertOutput, { a: 1 })

    assert.deepStrictEqual(output, assertOutput)
  })

  t.test('should allow nesting through objects', () => {
    let def = { a: { b: 2 } }
    let output = defaults({ a: { c: 3} }, def)

    assert.deepStrictEqual(output.a, {
      b: 2,
      c: 3,
    })
  })
})
