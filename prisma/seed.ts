import { PrismaClient, AnimeStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Заполнение базы данных тестовыми данными...')

  // Хешируем пароли
  const hashedPassword = await bcrypt.hash('password', 10)

  // Создаем пользователей
  const admin = await prisma.user.upsert({
    where: { email: 'admin@anime.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@anime.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'otaku@anime.com' },
    update: {},
    create: {
      username: 'otaku_master',
      email: 'otaku@anime.com',
      password: hashedPassword,
      role: 'USER',
    },
  })

  console.log('Пользователи созданы:', { admin: admin.id, user: user.id })

  // Создаем аниме
  const animeList = [
    {
      title: 'Наруто',
      description: 'История о ниндзя, который мечтает стать Хокаге',
      genre: 'Сёнэн, Экшен',
      year: 2002,
      studio: 'Pierrot',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      createdBy: admin.id,
    },
    {
      title: 'Атака титанов',
      description: 'Человечество борется с гигантскими титанами',
      genre: 'Экшен, Драма',
      year: 2013,
      studio: 'Mappa',
      imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
      createdBy: admin.id,
    },
    {
      title: 'Тетрадь смерти',
      description: 'Студент находит тетрадь смерти',
      genre: 'Психологический триллер',
      year: 2006,
      studio: 'Madhouse',
      imageUrl: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400',
      createdBy: user.id,
    },
    {
      title: 'Твое имя',
      description: 'Романтическая история с элементами фантастики',
      genre: 'Романтика, Фантастика',
      year: 2016,
      studio: 'CoMix Wave Films',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400',
      createdBy: user.id,
    },
    {
      title: 'Клинок, рассекающий демонов',
      description: 'Мальчик становится охотником на демонов',
      genre: 'Сёнэн, Экшен',
      year: 2019,
      studio: 'Ufotable',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
      createdBy: admin.id,
    },
  ]

  const createdAnime = []
  for (const anime of animeList) {
    const created = await prisma.anime.create({ data: anime })
    createdAnime.push(created)
    console.log(`Аниме создано: ${created.title}`)
  }

  // Создаем оценки
  const ratings = [
    // Оценки админа
    {
      userId: admin.id,
      animeId: createdAnime[0].id, // Наруто
      storyRating: 9,
      artRating: 8,
      charactersRating: 10,
      soundRating: 9,
      overallRating: 9.0,
    },
    {
      userId: admin.id,
      animeId: createdAnime[1].id, // Атака титанов
      storyRating: 10,
      artRating: 10,
      charactersRating: 9,
      soundRating: 8,
      overallRating: 9.25,
    },
    {
      userId: admin.id,
      animeId: createdAnime[2].id, // Тетрадь смерти
      storyRating: 10,
      artRating: 7,
      charactersRating: 9,
      soundRating: 8,
      overallRating: 8.5,
    },
    {
      userId: admin.id,
      animeId: createdAnime[3].id, // Твое имя
      storyRating: 8,
      artRating: 10,
      charactersRating: 8,
      soundRating: 10,
      overallRating: 9.0,
    },
    {
      userId: admin.id,
      animeId: createdAnime[4].id, // Клинок
      storyRating: 8,
      artRating: 10,
      charactersRating: 8,
      soundRating: 9,
      overallRating: 8.75,
    },
    // Оценки пользователя
    {
      userId: user.id,
      animeId: createdAnime[0].id, // Наруто
      storyRating: 8,
      artRating: 7,
      charactersRating: 9,
      soundRating: 8,
      overallRating: 8.0,
    },
    {
      userId: user.id,
      animeId: createdAnime[1].id, // Атака титанов
      storyRating: 9,
      artRating: 10,
      charactersRating: 8,
      soundRating: 9,
      overallRating: 9.0,
    },
    {
      userId: user.id,
      animeId: createdAnime[2].id, // Тетрадь смерти
      storyRating: 10,
      artRating: 8,
      charactersRating: 10,
      soundRating: 7,
      overallRating: 8.75,
    },
    {
      userId: user.id,
      animeId: createdAnime[3].id, // Твое имя
      storyRating: 7,
      artRating: 9,
      charactersRating: 7,
      soundRating: 9,
      overallRating: 8.0,
    },
    {
      userId: user.id,
      animeId: createdAnime[4].id, // Клинок
      storyRating: 6,
      artRating: 8,
      charactersRating: 7,
      soundRating: 8,
      overallRating: 7.25,
    },
  ]

  for (const rating of ratings) {
    await prisma.rating.create({ data: rating })
  }
  console.log('Оценки созданы')

  // Создаем комментарии
  const comments = [
    {
      userId: admin.id,
      animeId: createdAnime[0].id,
      comment: 'Классическое аниме! Наруто - лучший ниндзя!',
    },
    {
      userId: user.id,
      animeId: createdAnime[1].id,
      comment: 'Очень темное и атмосферное аниме. Рекомендую всем!',
    },
    {
      userId: admin.id,
      animeId: createdAnime[2].id,
      comment: 'Гениальный психологический триллер. Лайт - злодей, но такой харизматичный!',
    },
    {
      userId: user.id,
      animeId: createdAnime[3].id,
      comment: 'Красивая анимация и трогательная история любви.',
    },
    {
      userId: admin.id,
      animeId: createdAnime[4].id,
      comment: 'Отличная анимация боев, но сюжет мог быть лучше.',
    },
  ]

  for (const comment of comments) {
    await prisma.comment.create({ data: comment })
  }
  console.log('Комментарии созданы')

  // Создаем статусы просмотра
  const statuses = [
    {
      userId: admin.id,
      animeId: createdAnime[0].id,
      status: AnimeStatus.COMPLETED,
    },
    {
      userId: admin.id,
      animeId: createdAnime[1].id,
      status: AnimeStatus.COMPLETED,
    },
    {
      userId: admin.id,
      animeId: createdAnime[4].id,
      status: AnimeStatus.WATCHING,
    },
    {
      userId: user.id,
      animeId: createdAnime[0].id,
      status: AnimeStatus.COMPLETED,
    },
    {
      userId: user.id,
      animeId: createdAnime[2].id,
      status: AnimeStatus.COMPLETED,
    },
    {
      userId: user.id,
      animeId: createdAnime[3].id,
      status: AnimeStatus.PLANNED,
    },
  ]

  for (const status of statuses) {
    await prisma.userAnimeStatus.create({ data: status })
  }
  console.log('Статусы просмотра созданы')

  console.log('База данных успешно заполнена тестовыми данными! 🎉')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
