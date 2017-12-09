import config from '../../config'

export async function testStatic(ctx) {
  ctx.body = {
    name: config.get('name'),
    version: config.get('version'),
    environment: config.get('NODE_ENV'),
  }
}
