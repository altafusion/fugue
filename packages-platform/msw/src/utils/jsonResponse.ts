import type { JsonBodyType } from 'msw'
import { HttpResponse } from 'msw'

export function jsonResponse<T extends JsonBodyType>(
  body: T,
  init?: ResponseInit,
) {
  return HttpResponse.json(body, init)
}
