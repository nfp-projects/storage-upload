import { verifyToken } from './security.mjs'
import { uploadFile } from './multer.mjs'

export async function upload(ctx) {
  let site = await verifyToken(ctx)

  let result = await uploadFile(ctx, site)

  ctx.body = {
    filename: result.filename,
    path: `/${site}/${result.filename}`
  }
}
