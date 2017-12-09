import request from 'request-json'

import defaults from '../api/defaults'
import config from '../config'

function parseBody(body, reject) {
  try {
    return JSON.parse(body)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(body)
    return reject(error)
  }
}

function callback(resolve, reject) {
  return (err, res, rawBody) => {
    let body = rawBody
    if (err) {
      return reject(err)
    }
    if (typeof body === 'string' && body) {
      body = parseBody(body, reject)
    }
    if (res.statusCode >= 300 ||
        res.statusCode < 200) {
      return reject(body)
    }
    resolve(body)
  }
}

export default function createClient(host = config.get('server:port'), opts) {
  let options = defaults(opts, {})

  let client = request.createClient('', options)
  let prefix

  prefix = `http://localhost:${host}`
  client.headers['x-request-id'] = 'asdf'

  client.auth = (user) => {
    // let m = helperDB.model('user', {
    //   id: user.id,
    //   level: (user.get && user.get('level')) || 1,
    //   institute_id: (user.get && user.get('institute_id')) || null,
    //   password: (user.get && user.get('password')) || null,
    // })
    // let token = jwt.createUserToken(m)
    // client.headers.authorization = `Bearer ${token}`
  }

  // Simple wrappers to wrap into promises
  client.getAsync = (path) =>
    new Promise((resolve, reject) => {
      if (path.slice(0, 4) === 'http') {
        return client.get(path, callback(resolve, reject))
      }
      client.get(prefix + path, callback(resolve, reject))
    })

  // Simple wrappers to wrap into promises
  client.saveFileAsync = (path, destination) =>
    new Promise((resolve, reject) => {
      client.saveFile(prefix + path, destination, callback(resolve, reject, true))
    })

  client.postAsync = (path, data) =>
    new Promise((resolve, reject) => {
      client.post(prefix + path, data, callback(resolve, reject))
    })

  client.putAsync = (path, data) =>
    new Promise((resolve, reject) => {
      client.put(prefix + path, data, callback(resolve, reject))
    })

  client.deleteAsync = (path) =>
    new Promise((resolve, reject) => {
      client.del(prefix + path, callback(resolve, reject))
    })

  client.sendFileAsync = (path, files, data) =>
    new Promise((resolve, reject) => {
      client.sendFile(prefix + path, files, data || {}, callback(resolve, reject))
    })

  return client
}
