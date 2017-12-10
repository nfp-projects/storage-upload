import * as jwt from '../jwt'
import config from '../../config'

export async function verifyToken(ctx) {
  if (!ctx.query.token) {
    throw new Error('Token is missing in query')
  }

  let decoded = jwt.decode(ctx.query.token)

  if (!decoded || !decoded.site) {
    throw new Error('Token is invalid')
  }

  let output = await jwt.verify(
    ctx.query.token,
    config.get(`sites:${decoded.site}`)
  )

  return output.site
}
