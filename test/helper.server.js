// import _ from 'lodash'
// import sinon from 'sinon'
import server from '../server'
import client from './helper.client'

after(() => server.close())

export const createClient = client
