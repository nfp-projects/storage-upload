import config from '../../config'
import { verifyToken } from './security'
import { uploadFile, rename } from './multer'

export async function upload(ctx) {
  let site = await verifyToken(ctx)

  let result = await uploadFile(ctx, site)

  ctx.body = {
    filename: result.filename,
    path: `/${site}/${result.filename}`
  }
}
