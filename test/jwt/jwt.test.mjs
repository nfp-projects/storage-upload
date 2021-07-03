import { Eltro as t, assert} from 'eltro'
import encode from '../../api/jwt/encode.mjs'
import decode from '../../api/jwt/decode.mjs'
import defaults from '../../api/defaults.mjs'

const unixNow = Math.floor(Date.now() / 1000)
const jwtHeader = {
  typ: 'JWT',
  alg: 'HS256',
  kid: '2'
}

const jwtBody = {
  aud: 'https://host/oauth/token',
  iss: 'test@test.com',
  iat: unixNow,
  exp: unixNow + 600,
  scope: ['http://stuff', 'http://stuff2']
}

const pubKeys = {
  'test@test.com': {
    'default@HS256': 'sharedkey',
    '2@HS256': 'sharedkey',
    '2@HS384': 'sharedkey',
    '2@HS512': 'sharedkey',
    '5@HS256': 'wrongkey'
  },
  'test@custom.com': {
    '2@HS256': {
      key: 'sharedkey',
      expiresSkew: 600,
      expiresMax: 86400
    },
    '3@HS256': {
    },
    '4@HS256': [],
    '5@HS256': { key: 'sharedkey' },
  },
}

t.describe('encode/decode', function() {
  ['HS256', 'HS384', 'HS512'].forEach(function(algo) {
    t.test('success with ' + algo, function() {
      let customJwtHeader = defaults(jwtHeader)
      customJwtHeader.kid = '2'
      customJwtHeader.alg = algo
      let jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
      let decodedJwtBody = decode(jwt, pubKeys, [
        'https://host/oauth/token'
      ])
      assert.deepStrictEqual(jwtBody, decodedJwtBody)
    })
  })
  t.test('success without kid', function() {
    let customJwtHeader = defaults(jwtHeader)
    delete customJwtHeader.kid
    let jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
    let decodedJwtBody = decode(jwt, pubKeys, [
      'https://host/oauth/token'
    ])
    assert.deepStrictEqual(jwtBody, decodedJwtBody)
  })
  t.test('success with object key', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.kid = '5'
    customJwtBody.iss = 'test@custom.com'
    let jwt = encode(jwtHeader, jwtBody, 'sharedkey')
    let decodedJwtBody = decode(jwt, pubKeys, [
      'https://host/oauth/token'
    ])
    assert.deepStrictEqual(jwtBody, decodedJwtBody)
  })
  t.test('success with array aud', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.aud = [
      'https://myhost/oauth/token',
      'https://host/oauth/token'
    ]
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    let decodedJwtBody = decode(jwt, pubKeys, [
      'https://host/oauth/token'
    ])
    assert.deepStrictEqual(customJwtBody, decodedJwtBody)
  })
  t.test('success with expired token', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.iss = 'test@custom.com'
    customJwtBody.exp -= 600
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    let decodedJwtBody = decode(jwt, pubKeys, [
      'https://host/oauth/token'
    ])
    assert.deepStrictEqual(customJwtBody, decodedJwtBody)
  })
  t.test('token outside maximum expires', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.iss = 'test@custom.com'
    customJwtBody.exp += 172800
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Expires in the future by more than 86400 seconds/
    )
  })
  t.test('token outside maximum expires using decode options', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.exp += 172800
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'], {
          expiresMax: 600
        })
      },
      /Expires in the future by more than 600 seconds/
    )
  })
  t.test('token outside maximum expires using nbf', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.exp += 172800
    customJwtBody.nbf = customJwtBody.iat
    delete customJwtBody.iat
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'], {
          expiresMax: 600
        })
      },
      /Expires in the future by more than 600 seconds/
    )
  })
  t.test('token outside maximum expires using unixNow', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.exp += 172800
    delete customJwtBody.iat
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'], {
          expiresMax: 600
        })
      },
      /Expires in the future by more than 600 seconds/
    )
  })
  t.test('unknown aud', function() {
    let jwt = encode(jwtHeader, jwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://myhost/oauth/token'])
      },
      /Unknown audience 'https:\/\/host\/oauth\/token'/
    )
  })
  t.test('expired', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.iat -= 1200
    customJwtBody.exp -= 800
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Token has expired/
    )
  })
  t.test('missing exp', function() {
    let customJwtBody = defaults(jwtBody)
    delete customJwtBody.exp
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /No expires set on token/
    )
  })
  t.test('missing iss', function() {
    let customJwtBody = defaults(jwtBody)
    delete customJwtBody.iss
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /No issuer set/
    )
  })
  t.test('iat invalid', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.iat += 1200
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Issued at in the future by more than 300 seconds/
    )
  })
  t.test('nbf invalid', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.nbf = customJwtBody.iat + 1200
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Not before in the future by more than 300 seconds/
    )
  })
  t.test('unknown issuer', function() {
    let customJwtBody = defaults(jwtBody)
    customJwtBody.iss = 'unknown@test.com'
    let jwt = encode(jwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Unknown issuer 'unknown@test.com'/
    )
  })
  t.test('wrong alg', function() {
    let customJwtHeader = defaults(jwtHeader)
    customJwtHeader.alg = 'HS128'
    assert.throws(
      function() {
        encode(customJwtHeader, jwtBody, 'sharedkey')
      },
      /Only alg HS256, HS384 and HS512 are supported/
    )
  })
  t.test('unknown kid', function() {
    let customJwtHeader = defaults(jwtHeader)
    customJwtHeader.kid = '3'
    let jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Unknown pubkey id '3' for this issuer/
    )
  })
  t.test('invalid signature', function() {
    let customJwtHeader = defaults(jwtHeader)
    customJwtHeader.kid = '2'
    let jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
    let backup = jwt
    if (jwt[jwt.length - 2] === 'A') {
      jwt = jwt.slice(0, -2) + 'BB'
    } else {
      jwt = jwt.slice(0, -2) + 'AA'
    }
    try {
      assert.throws(
        function() {
          decode(jwt, pubKeys, ['https://host/oauth/token'])
        },
        /Verification failed with alg 'HS256'/
      )
    } catch (err) {
      console.log('-----')
      console.log(backup)
      console.log(jwt)
      throw err
    }
    jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
    jwt += 'a'
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Verification failed with alg 'HS256'/
    )
  })
  t.test('invalid shared key', function() {
    let customJwtHeader = defaults(jwtHeader)
    customJwtHeader.kid = '5'
    customJwtHeader.alg = 'HS256'
    let jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /Verification failed with alg 'HS256'/
    )
  })
  t.test('invalid pubkey', function() {
    let customJwtHeader = defaults(jwtHeader)
    customJwtHeader.kid = '4'
    let jwt = encode(customJwtHeader, jwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      }
    )
    let customJwtBody = defaults(jwtBody)
    customJwtBody.iss = 'test@custom.com'
    customJwtHeader.kid = '3'
    jwt = encode(customJwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /'3'.+misconfigured/
    )
    customJwtHeader.kid = '4'
    jwt = encode(customJwtHeader, customJwtBody, 'sharedkey')
    assert.throws(
      function() {
        decode(jwt, pubKeys, ['https://host/oauth/token'])
      },
      /'4'.+misconfigured/
    )
  })
  t.test('success with broken token', function() {
    let expectedJwtBody = {
      id: 1,
      exp: 1519802991,
      iat: 1519802691,
      iss: 'test@test.com',
      aud: 'https://host/oauth/token'
    }
    let decodedJwtBody = decode(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTE5ODAyNjkxfQ.p6t378Ri2JpOCm9WtC36ttyH8ILzG9-OWT_kgMrrRfo',
      pubKeys,
      ['https://host/oauth/token'],
      {
        fixup: (header, body) => {
          header.kid = '2'
          body.iss = 'test@test.com'
          body.aud = 'https://host/oauth/token'
          body.exp = body.iat + 300
        },
        expiresSkew: 307584000
      }
    )
    assert.deepStrictEqual(decodedJwtBody, expectedJwtBody)
  })
})
