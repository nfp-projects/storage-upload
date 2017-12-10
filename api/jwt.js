import jwt from 'jsonwebtoken'

export function sign(value, secret) {
  return jwt.sign(value, secret)
}

export function verify(token, secret) {
  return new Promise((resolve, reject) =>
    jwt.verify(token, secret, (err, res) => {
      if (err) return reject(err)

      resolve(res)
    })
  )
}

export function decode(token) {
  return jwt.decode(token)
}
