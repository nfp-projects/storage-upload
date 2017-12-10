const fs = require('fs')
import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.fieldname + '-' + Date.now())
  }
})

export function uploadFile(ctx, siteName) {
  return new Promise((res, rej) => {
    const date = new Date()

    // Generate 'YYYYMMDD_HHMMSS_' prefix
    const prefix = date
      .toISOString()
      .replace(/-/g, '')
      .replace('T', '_')
      .replace(/:/g, '')
      .replace(/\..+/, '_')

    const storage = multer.diskStorage({
      destination: `./public/${siteName}`,
      filename: (req, file, cb) =>
        cb(null, `${prefix}${file.originalname}`),
    })

    multer({ storage: storage })
      .single('file')(ctx.req, ctx.res, (err, data) => {
        if (err) return rej(err)
        return res(ctx.req.file)
      })
  })
}
