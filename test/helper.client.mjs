import http from 'http'
import { URL } from 'url'
import defaults from '../api/defaults.mjs'
import config from '../api/config.mjs'

export default function Client(port = config.get('server:port'), opts) {
  this.options = defaults(opts, {})
  this.prefix = `http://localhost:${port}`
}

Client.prototype.customRequest = function(method = 'GET', path, body, options) {
  if (path.slice(0, 4) !== 'http') {
    path = this.prefix + path
  }
  let urlObj = new URL(path)

  return new Promise((resolve, reject) => {
    const opts = defaults(defaults(options, {
      method: method,
      timeout: 500,
      protocol: urlObj.protocol,
      username: urlObj.username,
      password: urlObj.password,
      host: urlObj.hostname,
      port: Number(urlObj.port),
      path: urlObj.pathname + urlObj.search,
    }))

    const req = http.request(opts)
    if (body) {
      req.write(body)
    }

    req.on('error', reject)
    req.on('timeout', function() { reject(new Error(`Request ${method} ${path} timed out`)) })
    req.on('response', res => {
      res.setEncoding('utf8')
      let output = ''

      res.on('data', function (chunk) {
        output += chunk.toString()
      })

      res.on('end', function () {
        try {
          output = JSON.parse(output)
        } catch (e) {
          return reject(new Error(`${e.message} while decoding: ${output}`))
        }
        if (output.status) {
          let err = new Error(`Request failed [${output.status}]: ${output.message}`)
          err.body = output
          return reject(err)
        }
        resolve(output)
      })
    })
    req.end()
  })
}

Client.prototype.get = function(path = '/') {
  return this.customRequest('GET', path, null)
}

/*

export function createClient(host = config.get('server:port'), opts) {
  let options = defaults(opts, {})

  let prefix = `http://localhost:${host}`
  options.headers['x-request-id'] = 'asdf'

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

*/
