import Koa from 'koa'

import config from './config'
import router from './api/router'
import { errorMiddleware } from './api/error'

const app = new Koa()

app.use(errorMiddleware)
app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(config.get('server:port'))

export default server
