import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/db/client'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const {
      email, password, name,
      phone, gender, birthYear, church, region, agreedToTerms,
    } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
    }
    if (!agreedToTerms) {
      return NextResponse.json({ error: '이용약관에 동의해주세요.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용중인 이메일입니다.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name.trim(),
        phone: phone?.trim() || null,
        gender: gender || null,
        birthYear: birthYear ? Number(birthYear) : null,
        church: church?.trim() || null,
        region: region?.trim() || null,
        agreedToTerms: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[register]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
