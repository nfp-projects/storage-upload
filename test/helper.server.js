// import _ from 'lodash'
// import sinon from 'sinon'
import server from '../server'
import client from './helper.client'
import defaults from '../api/defaults'

after(() => server.close())

export const createClient = client

export function createContext(opts) {
  return defaults(opts, {
    query: { },
    req: { },
    res: { },
  })
}
