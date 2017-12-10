import Router from 'koa-router'

import * as test from './test/routes'
import * as media from './media/routes'

const router = new Router()

router.get('/', test.testStatic)
router.post('/media', media.upload)

export default router
