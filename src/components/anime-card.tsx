'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Calendar, Eye, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface AnimeCardProps {
  id: number
  title: string
  description?: string | null
  genre?: string | null
  year?: number | null
  studio?: string | null
  imageUrl?: string | null
  averageRating?: number
  ratingsCount?: number
  commentsCount?: number
  viewsCount?: number
}

export function AnimeCard({
  id,
  title,
  description,
  genre,
  year,
  studio,
  imageUrl,
  averageRating = 0,
  ratingsCount = 0,
  commentsCount = 0,
  viewsCount = 0,
}: AnimeCardProps) {
  return (
    <Link href={`/anime/${id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={imageUrl || '/placeholder-anime.jpg'}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Рейтинг */}
            {averageRating > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md text-sm text-white">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
              </div>
            )}

            {/* Год выпуска */}
            {year && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md text-sm text-white">
                <Calendar className="h-3 w-3" />
                <span>{year}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {studio && (
            <p className="text-sm text-muted-foreground mb-2">
              Студия: <span className="font-medium">{studio}</span>
            </p>
          )}

          {genre && (
            <div className="flex flex-wrap gap-1">
              {genre.split(', ').map((g, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {ratingsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>{ratingsCount}</span>
                </div>
              )}

              {commentsCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{commentsCount}</span>
                </div>
              )}

              {viewsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{viewsCount}</span>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
