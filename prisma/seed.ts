import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Очищаем существующие данные
  await prisma.commentLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.userAnimeStatus.deleteMany({});
  await prisma.loginAttempt.deleteMany({});
  await prisma.anime.deleteMany({});
  await prisma.user.deleteMany({});

  // Создаем пользователей
  const adminPassword = await bcrypt.hash("password", 10);
  const userPassword = await bcrypt.hash("password", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@anime.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      username: "otaku_master",
      email: "otaku@anime.com",
      password: userPassword,
      role: "USER",
    },
  });

  // Создаем аниме
  const naruto = await prisma.anime.create({
    data: {
      title: "Наруто",
      description: "История о ниндзя, который мечтает стать Хокаге",
      genre: "Сёнэн, Экшен",
      year: 2002,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      createdBy: admin.id,
    },
  });

  const attackOnTitan = await prisma.anime.create({
    data: {
      title: "Атака титанов",
      description: "Человечество борется с гигантскими титанами",
      genre: "Экшен, Драма",
      year: 2013,
      imageUrl: "https://images.unsplash.com/photo-1606898924982-b8577b4de7b4?w=400",
      createdBy: admin.id,
    },
  });

  const deathNote = await prisma.anime.create({
    data: {
      title: "Тетрадь смерти",
      description: "Студент находит тетрадь смерти",
      genre: "Психологический триллер",
      year: 2006,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      createdBy: user.id,
    },
  });

  const yourName = await prisma.anime.create({
    data: {
      title: "Твое имя",
      description: "Романтическая история с элементами фантастики",
      genre: "Романтика, Фантастика",
      year: 2016,
      imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
      createdBy: user.id,
    },
  });

  const demonSlayer = await prisma.anime.create({
    data: {
      title: "Истребитель демонов",
      description: "Мальчик становится охотником на демонов",
      genre: "Сёнэн, Экшен",
      year: 2019,
      imageUrl: "https://images.unsplash.com/photo-1606898924982-b8577b4de7b4?w=400",
      createdBy: admin.id,
    },
  });

  // Создаем рейтинги
  await prisma.rating.create({
    data: {
      userId: admin.id,
      animeId: naruto.id,
      storyRating: 9,
      artRating: 8,
      charactersRating: 10,
      soundRating: 9,
      overallRating: 9.0,
    },
  });

  await prisma.rating.create({
    data: {
      userId: admin.id,
      animeId: attackOnTitan.id,
      storyRating: 10,
      artRating: 10,
      charactersRating: 9,
      soundRating: 8,
      overallRating: 9.25,
    },
  });

  await prisma.rating.create({
    data: {
      userId: user.id,
      animeId: naruto.id,
      storyRating: 8,
      artRating: 7,
      charactersRating: 9,
      soundRating: 8,
      overallRating: 8.0,
    },
  });

  // Создаем комментарии
  await prisma.comment.create({
    data: {
      userId: admin.id,
      animeId: naruto.id,
      comment: "Классическое аниме! Наруто - лучший ниндзя!",
    },
  });

  await prisma.comment.create({
    data: {
      userId: user.id,
      animeId: attackOnTitan.id,
      comment: "Очень темное и атмосферное аниме. Рекомендую всем!",
    },
  });

  await prisma.comment.create({
    data: {
      userId: admin.id,
      animeId: deathNote.id,
      comment: "Гениальный психологический триллер. Лайт - злодей, но такой харизматичный!",
    },
  });

  // Создаем статусы просмотра
  await prisma.userAnimeStatus.create({
    data: {
      userId: admin.id,
      animeId: naruto.id,
      status: "COMPLETED",
    },
  });

  await prisma.userAnimeStatus.create({
    data: {
      userId: user.id,
      animeId: attackOnTitan.id,
      status: "WATCHING",
    },
  });

  console.log("База данных заполнена тестовыми данными!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
