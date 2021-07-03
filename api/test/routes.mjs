import config from '../config.mjs'

export async function testStatic(ctx) {
  ctx.body = {
    name: config.get('name'),
    version: config.get('version'),
    environment: config.get('NODE_ENV'),
  }
}

export async function testError(ctx) {
  throw new Error('This is a test')
}
