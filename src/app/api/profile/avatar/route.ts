import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const body = await request.json()
    const avatarUrl = (body?.avatarUrl ?? '').toString().trim()
    if (!avatarUrl) {
      return NextResponse.json({ error: 'Некорректный URL аватара' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { avatar: avatarUrl },
      select: { id: true, username: true, email: true, avatar: true }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Ошибка при обновлении аватара:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
