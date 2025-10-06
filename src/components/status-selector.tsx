"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type Status = 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED'

interface Props {
  animeId: number
}

export function StatusSelector({ animeId }: Props) {
  const { data: session } = useSession()
  const [userStatus, setUserStatus] = useState<Status | null>(null)
  const [counts, setCounts] = useState<{ [K in Status]: number }>({ PLANNED: 0, WATCHING: 0, COMPLETED: 0, DROPPED: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/anime/${animeId}/status`)
      const data = await res.json()
      if (res.ok) {
        setUserStatus(data.userStatus || null)
        setCounts(data.counts)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, session?.user?.id])

  const setStatus = async (status: Status) => {
    if (!session) return
    setError('')
    try {
      const res = await fetch(`/api/anime/${animeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (res.ok) {
        setUserStatus(data.userStatus || status)
        setCounts(data.counts)
      } else {
        setError(data.error || 'Не удалось изменить статус')
      }
    } catch (e) {
      console.error(e)
      setError('Произошла ошибка при изменении статуса')
    }
  }

  const items: { value: Status; label: string }[] = [
    { value: 'PLANNED', label: 'Запланировано' },
    { value: 'WATCHING', label: 'Смотрю' },
    { value: 'COMPLETED', label: 'Завершено' },
    { value: 'DROPPED', label: 'Брошено' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статус просмотра</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {session ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {items.map((item) => (
                <Button
                  key={item.value}
                  variant={userStatus === item.value ? 'default' : 'outline'}
                  onClick={() => setStatus(item.value)}
                >
                  <div className="flex flex-col items-center w-full">
                    <span>{item.label}</span>
                    <Badge variant="secondary" className="mt-1">{counts[item.value]}</Badge>
                  </div>
                </Button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Ваш статус: {userStatus ? items.find(i => i.value === userStatus)?.label : 'не установлен'}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Войдите, чтобы установить статус просмотра
          </div>
        )}
      </CardContent>
    </Card>
  )
}
