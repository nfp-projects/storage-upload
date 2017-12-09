import Router from 'koa-router'

import * as test from './test/routes'

const router = new Router()

router.get('/api/test', test.testStatic)

export default router
