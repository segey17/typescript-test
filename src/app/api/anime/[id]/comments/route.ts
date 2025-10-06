import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function mapComments(comments: any[], sessionUserId?: number) {
  return comments.map((c) => {
    const likesCount = c.likes.filter((l: any) => l.likeType === 'LIKE').length
    const dislikesCount = c.likes.filter((l: any) => l.likeType === 'DISLIKE').length
    const userLike = sessionUserId ? c.likes.find((l: any) => l.userId === sessionUserId) : null
    return {
      id: c.id,
      comment: c.comment,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        username: c.user.username,
        avatar: c.user.avatar,
      },
      likesCount,
      dislikesCount,
      userLikeType: userLike?.likeType ?? null,
    }
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const animeId = parseInt(params.id)

    if (isNaN(animeId)) {
      return NextResponse.json(
        { error: 'Неверный ID аниме' },
        { status: 400 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: { animeId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const mapped = mapComments(comments, session?.user?.id ? parseInt(session.user.id) : undefined)

    return NextResponse.json({ comments: mapped })
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

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

    const animeId = parseInt(params.id)
    if (isNaN(animeId)) {
      return NextResponse.json(
        { error: 'Неверный ID аниме' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const text: string = (body?.comment ?? '').toString().trim()
    if (!text || text.length < 2) {
      return NextResponse.json(
        { error: 'Комментарий слишком короткий' },
        { status: 400 }
      )
    }
    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Комментарий слишком длинный' },
        { status: 400 }
      )
    }

    // Проверяем существование аниме
    const anime = await prisma.anime.findUnique({ where: { id: animeId } })
    if (!anime) {
      return NextResponse.json(
        { error: 'Аниме не найдено' },
        { status: 404 }
      )
    }

    const created = await prisma.comment.create({
      data: {
        userId: parseInt(session.user.id),
        animeId,
        comment: text,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        likes: true,
      },
    })

    const mapped = mapComments([created], parseInt(session.user.id))[0]

    return NextResponse.json({ comment: mapped })
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
