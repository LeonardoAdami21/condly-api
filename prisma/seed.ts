import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';

const url = new URL(process.env.DATABASE_URL!);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@condly.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Administrador',
      email,
      role: Role.ADMIN,
      password: await bcrypt.hash(password, 10),
    },
  });
  console.log(`Admin disponível: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
