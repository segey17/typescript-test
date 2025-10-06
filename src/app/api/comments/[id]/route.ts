import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const commentId = parseInt(params.id)
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Неверный ID комментария' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment) {
      return NextResponse.json(
        { error: 'Комментарий не найден' },
        { status: 404 }
      )
    }

    const isOwner = comment.userId === parseInt(session.user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdmin = ((session.user as any).role ?? '').toString().toUpperCase() === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления' },
        { status: 403 }
      )
    }

    await prisma.comment.delete({ where: { id: commentId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при удалении комментария:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
