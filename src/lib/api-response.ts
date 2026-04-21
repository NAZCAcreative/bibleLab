// Design Ref: §6.2 — 통일된 API 응답 형식
import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 })
}

export function badRequest(message: string, fieldErrors?: Record<string, string[]>) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message, details: fieldErrors ? { fieldErrors } : undefined } },
    { status: 400 }
  )
}

export function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
    { status: 401 }
  )
}

export function notFound(message = '리소스를 찾을 수 없습니다.') {
  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message } },
    { status: 404 }
  )
}

export function serverError(message = '서버 오류가 발생했습니다.') {
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 }
  )
}
