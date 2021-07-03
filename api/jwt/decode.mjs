import crypto from 'crypto'
import defaults from '../defaults.mjs'
import * as base64UrlSafe from './base64urlsafe.mjs'

const defaultOptions = {
  expiresSkew: 0,
  expiresMax: 0,
  nbfIatSkew: 300,
  fixup: null
}

/**
 *
 * @param {string} jwt
 * @param {Object} publicKeys
 * @param {Array<string>} audiences
 * @param {Object} [options]
 * @param {Object} [options.expiresSkew=0]
 * @param {Object} [options.expiresMax=0]
 * @param {Object} [options.nbfIatSkew=300]
 * @param {Function<header,body,void>} [options.fixup]
 */
 export default function decode(jwt, publicKeys, audiences, options = defaultOptions) {
  if (typeof jwt !== 'string') {
    throw new Error('jwt needs to a string')
  }

  if (typeof publicKeys !== 'object' || Array.isArray(publicKeys)) {
    throw new Error(
      'publicKeys needs to be a map of { issuer: { keyid: "PEM encoded key" }'
    )
  }

  if (!Array.isArray(audiences)) {
    throw new Error('audiences needs to be an array of allowed audiences')
  }

  if (typeof options !== 'object' || Array.isArray(publicKeys)) {
    throw new Error('options needs to a map of { nbfIatSkew: 300, ... }')
  }

  let parts = jwt.split(/\./)
  if (parts.length !== 3) {
    throw new Error('JWT does not contain 3 dots')
  }

  let header = JSON.parse(base64UrlSafe.decode(parts[0]).toString('utf8'))
  let body = JSON.parse(base64UrlSafe.decode(parts[1]).toString('utf8'))
  if (typeof options.fixup === 'function') {
    options.fixup(header, body)
  }

  let hmacAlgo = null
  switch (header.alg) {
    case 'HS256':
      hmacAlgo = 'sha256'
      break
    case 'HS384':
      hmacAlgo = 'sha384'
      break
    case 'HS512':
      hmacAlgo = 'sha512'
      break
    default:
      throw new Error(
        'Only alg HS256, HS384 and HS512 are supported'
      )
  }

  if (!body.iss) {
    throw new Error('No issuer set')
  }

  let issuer = publicKeys[body.iss]
  if (!issuer) {
    throw new Error(`Unknown issuer '${body.iss}'`)
  }

  // Find public key
  let pubkeyOrSharedKey =
    typeof header.kid === 'string'
      ? issuer[`${header.kid}@${header.alg}`]
      : issuer[`default@${header.alg}`]
  let overrideOptions = {}

  if (!pubkeyOrSharedKey) {
    throw new Error(
      `Unknown pubkey id '${header.kid}' for this issuer`
    )
  } else if ((typeof(pubkeyOrSharedKey) !== 'object' || Array.isArray(pubkeyOrSharedKey)) && typeof(pubkeyOrSharedKey) !== 'string') {
    throw new Error(
      `Pubkey of '${header.kid || 'default'}' for '${header.alg}' for this issuer is misconfigured`
    )
  }
  if (typeof(pubkeyOrSharedKey) === 'object') {
    if (typeof(pubkeyOrSharedKey.key) !== 'string') {
      throw new Error(
        `Pubkey of '${header.kid || 'default'}' for '${header.alg}' for this issuer is misconfigured`
      )
    }
    overrideOptions = pubkeyOrSharedKey
    pubkeyOrSharedKey = pubkeyOrSharedKey.key
  }

  let signatureOrHash = base64UrlSafe.decode(parts[2])
  const hmac = crypto.createHmac(hmacAlgo, pubkeyOrSharedKey)
  hmac.update(`${parts[0]}.${parts[1]}`, 'utf8')
  let signatureBuffer = hmac.digest()

  if (signatureOrHash.length !== signatureBuffer.length || !crypto.timingSafeEqual(signatureOrHash, signatureBuffer)) {
    throw new Error(`Verification failed with alg '${header.alg}'`)
  }

  let unixNow = Math.floor(Date.now() / 1000)

  let validators = defaults(options.validators, {
    aud: validateAudience,
    exp: validateExpires,
    iat: validateIssuedAt,
    nbf: validateNotBefore
  })

  let validationOptions = defaults(overrideOptions, options)

  validators.aud(body, audiences, validationOptions)
  validators.iat(body, unixNow, validationOptions)
  validators.nbf(body, unixNow, validationOptions)
  validators.exp(body, unixNow, validationOptions)

  return body
}

function validateNotBefore(body, unixNow, options) {
  if (body.nbf && body.nbf > unixNow + options.nbfIatSkew) {
    throw new Error(
      `Not before in the future by more than ${options.nbfIatSkew} seconds`
    )
  }
}

function validateIssuedAt(body, unixNow, options) {
  if (body.iat && body.iat > unixNow + options.nbfIatSkew) {
    throw new Error(
      `Issued at in the future by more than ${options.nbfIatSkew} seconds`
    )
  }
}

function validateAudience(body, audiences, options) {
  let auds = Array.isArray(body.aud) ? body.aud : [body.aud]
  if (!auds.some(aud => audiences.includes(aud))) {
    throw new Error(`Unknown audience '${auds.join(',')}'`)
  }
}

function validateExpires(body, unixNow, options) {
  if (!body.exp) {
    throw new Error(`No expires set on token`)
  }
  let notBefore = body.iat || body.nbf || unixNow
  if (options.expiresMax && body.exp > notBefore + options.expiresMax) {
    throw new Error(
      `Expires in the future by more than ${options.expiresMax} seconds`
    )
  }
  if (body.exp + (options.expiresSkew || 0) <= unixNow) {
    throw new Error('Token has expired')
  }
}
