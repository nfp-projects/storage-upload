# storage-upload

Docker micro service for uploading files to a storage server.

# Usage

storage-upload listens on port 4020 by default. Since the storage upload needs a place to store the uploaded files, it's important to map the `/app/public` folder to either locally or some volume.

In addition it's recommended to also map the config file `/app/config/config.production.json` which should include a list of accepted sites and the corresponding json web token secret.

```bash
docker run -d \
  --name storage-upload \
  -v /path/to/store/files:/app/public \
  -v /path/to/config/file.json:/app/config/config.production.json \
  -p 4000:4020
  nfpis/storage-upload
```

### Config

The mapped config file should look something like this:

`config.production.json`
```json
{
  "sites": {
    "site1": "site1-secret",
    "site2": "site2-secret"
  }
}
```

The server checks the token in the query for supported site name and then verifies the secret match. To generate a token valid to upload to `site2` above, you can run something like this:

```node
const jwt = require('jsonwebtoken')

let token = jwt.sign({ site: 'site2' }, 'site2-secret')
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaXRlIjoic2l0ZTIifQ.Ovz7fnTMzaWOLOhnbkMtqHPk20EVqhCD8WDsLKk_Wv0
```

*Hint: Post the above token to https://jwt.io/ and check it out.*

Using the above token would save the requested file under `/app/public/site2/` folder

# API

## Media

Uploading or removing uploaded files on the storage server.

* **URL**

  /media

* **Method:**
  
  `POST`
  
*  **URL Params**
 
   `token=[site-token-here]`

* **Data Params**
   
   `file=@my-file-to-upload.jpg`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ filename: '20171210_115632_my-file-to-upload.jpg', path: '/development/20171210_115632_my-file-to-upload.jpg' }`
 
* **Error Response:**

  * **Code:** 422 UNPROCESSABLE ENTRY <br />
    **Content:** `{ status:422, message: "error message here" }`

* **Sample Call:**

  ```bash
  curl -X POST -F "file=@test.png" http://localhost:4000/media\?token\=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaXRlIjoidGVzdCJ9.2LAuYwb1bwiMPUWD3gNJKwt9PwLgctleLhYd6sc0FCU
  ```


# Example node.js helper

`upload.js`
```node
const http = require('http')
const path = require('path')
const fs = require('fs')

function upload(token, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) return reject(err)

      const crlf = '\r\n'
      const filename = path.basename(file)
      const boundary = `--${Math.random().toString(16)}`
      const headers = [
        `Content-Disposition: form-data; name="file"; filename="${filename}"` + crlf
      ]
      const multipartBody = Buffer.concat([
        new Buffer(
          `${crlf}--${boundary}${crlf}` +
          headers.join('') + crlf
        ),
        data,
        new Buffer(
          `${crlf}--${boundary}--`
        )
      ])

      const options = {
        port: 2111,
        hostname: 'storage01.nfp.is',
        method: 'POST',
        path: '/media?token=' + token,
        headers: {
          'Content-Type': 'multipart/form-data; boundary=' + boundary,
          'Content-Length': multipartBody.length
        },
      }

      const req = http.request(options)

      req.write(multipartBody)
      req.end()

      req.on('error', reject)

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
            // Do nothing
          }
          resolve(output)
        })
      })
    })
  })
}

// upload('insert-site-token-here', 'test.png')
//   .then(res => {
//     console.log('GOT RESULT', res)
//   }, err => {
//     console.log('ERROR', err)
//   })
```
