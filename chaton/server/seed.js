import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seed() {
  // Create 20 users
  const users = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(faker.name.findName())}&background=random&color=ffffff&size=128`,
        bio: faker.lorem.sentence(),
        location: faker.location.city(),
      },
    });
    users.push(user);
  }
  console.log("20 users created!");

  // Create 20 posts
  for (let i = 0; i < 20; i++) {
    await prisma.post.create({
      data: {
        id: uuidv4(),
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        createdAt: faker.date.recent(),
        authorId: users[Math.floor(Math.random() * users.length)].id, // Random user as the author
      },
    });
  }
  console.log("20 posts created!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
