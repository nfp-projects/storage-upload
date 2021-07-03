import { Eltro as t, assert} from 'eltro'
import encode from '../../api/jwt/encode.mjs'

t.describe('encode', function() {
  t.test('should faile with invalid header and body', function() {
    assert.throws(
      function() {
        encode('', '')
      },
      /both header and body should be of type object/
    )
  })
  t.test('should faile with empty header and body', function() {
    assert.throws(
      function() {
        encode({}, {})
      },
      /Only alg HS256, HS384 and HS512 are supported/
    )
  })
})
