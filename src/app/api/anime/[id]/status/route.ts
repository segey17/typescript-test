import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnimeStatus } from '@prisma/client'

function isValidStatus(status: string): status is AnimeStatus {
  return ['PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED'].includes(status)
}

async function getCounts(animeId: number) {
  const [planned, watching, completed, dropped] = await Promise.all([
    prisma.userAnimeStatus.count({ where: { animeId, status: 'PLANNED' } }),
    prisma.userAnimeStatus.count({ where: { animeId, status: 'WATCHING' } }),
    prisma.userAnimeStatus.count({ where: { animeId, status: 'COMPLETED' } }),
    prisma.userAnimeStatus.count({ where: { animeId, status: 'DROPPED' } }),
  ])
  return {
    PLANNED: planned,
    WATCHING: watching,
    COMPLETED: completed,
    DROPPED: dropped,
  }
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

    let userStatus: AnimeStatus | null = null
    if (session?.user?.id) {
      const record = await prisma.userAnimeStatus.findUnique({
        where: {
          unique_user_anime_status: {
            userId: parseInt(session.user.id),
            animeId,
          }
        }
      })
      userStatus = record?.status ?? null
    }

    const counts = await getCounts(animeId)

    return NextResponse.json({ userStatus, counts })
  } catch (error) {
    console.error('Ошибка при получении статуса:', error)
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
    const statusStr = (body?.status ?? '').toString().toUpperCase()
    if (!isValidStatus(statusStr)) {
      return NextResponse.json(
        { error: 'Неверный статус' },
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

    const userId = parseInt(session.user.id)

    const record = await prisma.userAnimeStatus.upsert({
      where: {
        unique_user_anime_status: {
          userId,
          animeId,
        }
      },
      update: { status: statusStr as AnimeStatus },
      create: {
        userId,
        animeId,
        status: statusStr as AnimeStatus,
      }
    })

    const counts = await getCounts(animeId)

    return NextResponse.json({ userStatus: record.status, counts })
  } catch (error) {
    console.error('Ошибка при изменении статуса:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
