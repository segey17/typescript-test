'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Star, TrendingUp } from 'lucide-react'

interface AnimeRatingProps {
  animeId: number
}

interface RatingData {
  userRating?: {
    storyRating: number
    artRating: number
    charactersRating: number
    soundRating: number
    overallRating: number
  } | null
  averageRatings: {
    story: string
    art: string
    characters: string
    sound: string
    overall: string
  }
  ratingsCount: number
}

export function AnimeRating({ animeId }: AnimeRatingProps) {
  const { data: session } = useSession()
  const [ratings, setRatings] = useState({
    story: 5,
    art: 5,
    characters: 5,
    sound: 5
  })
  const [data, setData] = useState<RatingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Загружаем рейтинги при монтировании
  useEffect(() => {
    loadRatings()
  }, [animeId, session])

  const loadRatings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/anime/${animeId}/rating`)
      const data = await response.json()

      if (response.ok) {
        setData(data)
        if (data.userRating) {
          setRatings({
            story: data.userRating.storyRating,
            art: data.userRating.artRating,
            characters: data.userRating.charactersRating,
            sound: data.userRating.soundRating
          })
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки рейтингов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (criterion: keyof typeof ratings, value: number[]) => {
    setRatings(prev => ({
      ...prev,
      [criterion]: value[0]
    }))
  }

  const handleSubmit = async () => {
    if (!session) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/anime/${animeId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyRating: ratings.story,
          artRating: ratings.art,
          charactersRating: ratings.characters,
          soundRating: ratings.sound,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setData(result)
        setSuccess('Рейтинг успешно сохранен!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Ошибка при сохранении рейтинга')
      }
    } catch (error) {
      console.error('Ошибка при отправке рейтинга:', error)
      setError('Произошла ошибка при сохранении рейтинга')
    } finally {
      setIsSubmitting(false)
    }
  }

  const overallRating = (ratings.story + ratings.art + ratings.characters + ratings.sound) / 4

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статистика рейтингов */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Рейтинги сообщества
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.averageRatings.overall}
                </div>
                <div className="text-sm text-muted-foreground">Общий</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{data.averageRatings.story}</div>
                <div className="text-sm text-muted-foreground">Сюжет</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{data.averageRatings.art}</div>
                <div className="text-sm text-muted-foreground">Рисовка</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{data.averageRatings.characters}</div>
                <div className="text-sm text-muted-foreground">Персонажи</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{data.averageRatings.sound}</div>
                <div className="text-sm text-muted-foreground">Звук</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              На основе {data.ratingsCount} оценок
            </div>
          </CardContent>
        </Card>
      )}

      {/* Форма оценивания */}
      {session ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {data?.userRating ? 'Обновить оценку' : 'Оценить аниме'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label>Сюжет: {ratings.story}/10</Label>
                <Slider
                  value={[ratings.story]}
                  onValueChange={(value: number[]) => handleRatingChange('story', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Рисовка: {ratings.art}/10</Label>
                <Slider
                  value={[ratings.art]}
                  onValueChange={(value) => handleRatingChange('art', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Персонажи: {ratings.characters}/10</Label>
                <Slider
                  value={[ratings.characters]}
                  onValueChange={(value) => handleRatingChange('characters', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Звук: {ratings.sound}/10</Label>
                <Slider
                  value={[ratings.sound]}
                  onValueChange={(value) => handleRatingChange('sound', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {overallRating.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Ваш общий рейтинг</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                data?.userRating ? 'Обновить оценку' : 'Сохранить оценку'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">
              Войдите в систему, чтобы оценить это аниме
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
