import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building, Eye, User } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { AnimeRating } from '@/components/anime-rating'
import { CommentsBox } from '@/components/comments-box'
import { StatusSelector } from '@/components/status-selector'

async function getAnimeById(id: number) {
  const anime = await prisma.anime.findUnique({
    where: { id },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        }
      },
      comments: {
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      userStatuses: {
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      },
      creator: {
        select: {
          username: true
        }
      }
    }
  })

  if (!anime) return null

  const averageRating = anime.ratings.length > 0
    ? anime.ratings.reduce((acc, rating) => acc + rating.overallRating, 0) / anime.ratings.length
    : 0

  const averageRatings = {
    story: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.storyRating, 0) / anime.ratings.length
      : 0,
    art: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.artRating, 0) / anime.ratings.length
      : 0,
    characters: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.charactersRating, 0) / anime.ratings.length
      : 0,
    sound: anime.ratings.length > 0
      ? anime.ratings.reduce((acc, rating) => acc + rating.soundRating, 0) / anime.ratings.length
      : 0,
  }

  return {
    ...anime,
    averageRating,
    averageRatings
  }
}

interface Props {
  params: { id: string }
}

export default async function AnimeDetailPage({ params }: Props) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const anime = await getAnimeById(id)
  if (!anime) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Постер */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={anime.imageUrl || '/placeholder-anime.jpg'}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </Card>
          </div>

          {/* Информация */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>

              {anime.genre && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {anime.genre.split(', ').map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {anime.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>Год выпуска: {anime.year}</span>
                  </div>
                )}

                {anime.studio && (
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span>Студия: {anime.studio}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Добавил: {anime.creator?.username || 'Неизвестно'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span>Просмотров: {anime.userStatuses.length}</span>
                </div>
              </div>

              {anime.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Описание</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {anime.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Рейтинги и статистика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <AnimeRating animeId={anime.id} />
          </div>

          <div>
            <StatusSelector animeId={anime.id} />
          </div>
        </div>

        {/* Комментарии */}
        <CommentsBox animeId={anime.id} />
      </div>
    </div>
  )
}
