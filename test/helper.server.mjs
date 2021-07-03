// import _ from 'lodash'
// import sinon from 'sinon'
import Client from './helper.client.mjs'
import defaults from '../api/defaults.mjs'
import '../api/server.mjs'

export function createClient() {
  return new Client()
}

export function createContext(opts) {
  return defaults(opts, {
    query: { },
    req: { },
    res: { },
  })
}
