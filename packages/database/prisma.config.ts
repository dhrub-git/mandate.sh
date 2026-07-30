import 'dotenv/config'; // <--- REQUIRED
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  // Point to your schema
  schema: 'prisma/schema.prisma',
  // Configure the database connection for migrations
  datasource: {
    url: process.env.DATABASE_URL,
  },
});