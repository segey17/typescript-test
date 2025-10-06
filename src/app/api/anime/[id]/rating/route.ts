import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { storyRating, artRating, charactersRating, soundRating } = body

    // Валидация рейтингов (1-10)
    const ratings = [storyRating, artRating, charactersRating, soundRating]
    if (!ratings.every(rating =>
      typeof rating === 'number' && rating >= 1 && rating <= 10
    )) {
      return NextResponse.json(
        { error: 'Все рейтинги должны быть числами от 1 до 10' },
        { status: 400 }
      )
    }

    // Проверяем существование аниме
    const anime = await prisma.anime.findUnique({
      where: { id: animeId }
    })

    if (!anime) {
      return NextResponse.json(
        { error: 'Аниме не найдено' },
        { status: 404 }
      )
    }

    // Вычисляем общий рейтинг
    const overallRating = (storyRating + artRating + charactersRating + soundRating) / 4

    // Создаем или обновляем рейтинг пользователя
    const rating = await prisma.rating.upsert({
      where: {
        unique_user_anime: {
          userId: parseInt(session.user.id),
          animeId: animeId
        }
      },
      update: {
        storyRating,
        artRating,
        charactersRating,
        soundRating,
        overallRating
      },
      create: {
        userId: parseInt(session.user.id),
        animeId,
        storyRating,
        artRating,
        charactersRating,
        soundRating,
        overallRating
      }
    })

    // Получаем обновленную статистику
    const avgRatings = await prisma.rating.aggregate({
      where: { animeId },
      _avg: {
        storyRating: true,
        artRating: true,
        charactersRating: true,
        soundRating: true,
        overallRating: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      rating,
      averageRatings: {
        story: avgRatings._avg.storyRating?.toFixed(1) || '0.0',
        art: avgRatings._avg.artRating?.toFixed(1) || '0.0',
        characters: avgRatings._avg.charactersRating?.toFixed(1) || '0.0',
        sound: avgRatings._avg.soundRating?.toFixed(1) || '0.0',
        overall: avgRatings._avg.overallRating?.toFixed(1) || '0.0'
      },
      ratingsCount: avgRatings._count.id
    })

  } catch (error) {
    console.error('Ошибка при добавлении рейтинга:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
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

    // Получаем рейтинг пользователя, если авторизован
    let userRating = null
    if (session?.user?.id) {
      userRating = await prisma.rating.findUnique({
        where: {
          unique_user_anime: {
            userId: parseInt(session.user.id),
            animeId: animeId
          }
        }
      })
    }

    // Получаем средние рейтинги
    const avgRatings = await prisma.rating.aggregate({
      where: { animeId },
      _avg: {
        storyRating: true,
        artRating: true,
        charactersRating: true,
        soundRating: true,
        overallRating: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      userRating,
      averageRatings: {
        story: avgRatings._avg.storyRating?.toFixed(1) || '0.0',
        art: avgRatings._avg.artRating?.toFixed(1) || '0.0',
        characters: avgRatings._avg.charactersRating?.toFixed(1) || '0.0',
        sound: avgRatings._avg.soundRating?.toFixed(1) || '0.0',
        overall: avgRatings._avg.overallRating?.toFixed(1) || '0.0'
      },
      ratingsCount: avgRatings._count.id
    })

  } catch (error) {
    console.error('Ошибка при получении рейтинга:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
