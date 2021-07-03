import crypto from 'crypto'
import * as base64UrlSafe from './base64urlsafe.mjs'

export default function encode(header, body, privateKeyPassword = null) {
  if (
    typeof header !== 'object' ||
    Array.isArray(header) ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    throw new Error('both header and body should be of type object')
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

  // Base64 encode header and body
  let headerBase64 = base64UrlSafe.encode(Buffer.from(JSON.stringify(header)))
  let bodyBase64 = base64UrlSafe.encode(Buffer.from(JSON.stringify(body)))
  let headerBodyBase64 = headerBase64 + '.' + bodyBase64

  const hmac = crypto.createHmac(hmacAlgo, privateKeyPassword)
  hmac.update(headerBodyBase64)
  let signatureBuffer = hmac.digest()

  // Construct final JWT
  let signatureBase64 = base64UrlSafe.encode(signatureBuffer)
  return headerBodyBase64 + '.' + signatureBase64
}