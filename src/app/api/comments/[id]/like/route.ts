import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LikeType } from '@prisma/client'

export async function POST(
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

    const body = await request.json()
    const typeStr = (body?.type ?? '').toString().toUpperCase()
    const validTypes: LikeType[] = [LikeType.LIKE, LikeType.DISLIKE]
    if (!validTypes.includes(typeStr as LikeType)) {
      return NextResponse.json(
        { error: 'Неверный тип лайка' },
        { status: 400 }
      )
    }
    const type = typeStr as LikeType

    // Проверяем существование комментария
    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment) {
      return NextResponse.json(
        { error: 'Комментарий не найден' },
        { status: 404 }
      )
    }

    const userId = parseInt(session.user.id)

    const existing = await prisma.commentLike.findUnique({
      where: {
        unique_user_comment: {
          userId,
          commentId,
        }
      }
    })

    let userLikeType: LikeType | null = null

    if (!existing) {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId,
          likeType: type,
        }
      })
      userLikeType = type
    } else if (existing.likeType === type) {
      // Повторный клик — снимаем лайк/дизлайк
      await prisma.commentLike.delete({ where: { id: existing.id } })
      userLikeType = null
    } else {
      await prisma.commentLike.update({
        where: { id: existing.id },
        data: { likeType: type }
      })
      userLikeType = type
    }

    const likesCount = await prisma.commentLike.count({ where: { commentId, likeType: 'LIKE' } })
    const dislikesCount = await prisma.commentLike.count({ where: { commentId, likeType: 'DISLIKE' } })

    return NextResponse.json({ likesCount, dislikesCount, userLikeType })
  } catch (error) {
    console.error('Ошибка при выставлении лайка:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
