import Router from 'koa-router'

import * as test from './test/routes.mjs'
import * as media from './media/routes.mjs'

const router = new Router()

router.get('/', test.testStatic)
router.get('/error', test.testError)
router.post('/media', media.upload)

export default router
