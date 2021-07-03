import Koa from 'koa-lite'

import config from './config.mjs'
import log from './log.mjs'
import router from './router.mjs'
import { errorMiddleware } from './error.mjs'

const app = new Koa()

app.use(errorMiddleware)
app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(config.get('server:port'), function(a,b) {
  log.info(`Server listening at ${config.get('server:port')}`)
})

export default server
