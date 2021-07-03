import { Eltro as t, assert} from 'eltro'
import decode from '../../api/jwt/decode.mjs'

const pubKeys = {}
const audiences = []

const testJwt =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2hvc3Qvb2F1dGgvdG9rZW4iLCJpc3MiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNTAzMzM1MTY5LCJleHAiOjE1MDMzMzU3NjksInNjb3BlIjpbImh0dHA6Ly9zdHVmZiIsImh0dHA6Ly9zdHVmZjIiXX0.zO278VV6NzwsvBrAIc15mOfwza-FkmLCV28NRXnrI550xw1S1145cS1UsZP5zXxcrk5f4oEgB91Jt6ble76yK5nU68fALUXtfe7xPUkhcOUIw92q_x_Iaaw4z6a71NtyishCfJlbmwkXXEq5YCVAvX3KNDtyPf_fQrAqjzsbgQc'

const testJwtWrongAlg =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzEyOCJ9.eyJhdWQiOiJodHRwczovL2hvc3Qvb2F1dGgvdG9rZW4iLCJpc3MiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNTAzMzM2NzU5LCJleHAiOjE1MDMzMzczNTksInNjb3BlIjpbImh0dHA6Ly9zdHVmZiIsImh0dHA6Ly9zdHVmZjIiXX0.12co2gXwBxmZ2uLJecd26bfteCLBx7jgu_9rp2hhKAHWA4qFKm1HcQOZXqDvHkjflQDtNAQ1ZUUf3U8kntUUAmMOjhHx0BspC-xuaTFylZWqj--A2_w9e7JSk46TF_x3e_hZLB3rtyuSEAPMh_nOCsmM-4A2fnQx0Y5p-Bwbt0I'

t.describe('jwtUtils', function() {
  t.describe('decode', function() {
    t.test('invalid jwt input', function() {
      assert.throws(
        function() {
          decode({}, pubKeys, audiences)
        },
        /jwt needs to a string/
      )
    })
    t.test('invalid pubKeys input', function() {
      assert.throws(
        function() {
          decode(testJwt, [], audiences)
        },
        /publicKeys needs to be a map of { issuer: { keyid: "PEM encoded key" }/
      )
    })
    t.test('invalid audiences input', function() {
      assert.throws(
        function() {
          decode(testJwt, pubKeys, '')
        },
        /audiences needs to be an array of allowed audiences/
      )
    })
    t.test('invalid options input', function() {
      assert.throws(
        function() {
          decode(testJwt, pubKeys, audiences, '')
        },
        /options needs to a map of { nbfIatSkew: 300, ... }/
      )
    })
    t.test('too few spaces', function() {
      assert.throws(
        function() {
          decode('hello.test', pubKeys, audiences)
        },
        /JWT does not contain 3 dots/
      )
    })
    t.test('invalid json', function() {
      assert.throws(
        function() {
          decode(testJwt.substr(10), pubKeys, audiences)
        },
        /Unexpected token \$ in JSON at position 0/
      )
    })
    t.test('wrong alg', function() {
      assert.throws(
        function() {
          decode(testJwtWrongAlg, pubKeys, audiences)
        },
        /Only alg HS256, HS384 and HS512 are supported/
      )
    })
  })
})