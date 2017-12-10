
export async function errorMiddleware(ctx, next) {
  try {
    await next()
  } catch (e) {
    ctx.status = 422
    ctx.body = {
      status: 422,
      message: e.message,
    }
  }
}
