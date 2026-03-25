
import "dotenv/config"
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 1. Load your connection string
console.log("DATABASE_URL:", process.env.DATABASE_URL)
const connectionString = process.env.DATABASE_URL

// 2. Create the driver adapter
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// 3. Pass the adapter to the PrismaClient
export const db = new PrismaClient({ adapter })
export * from '@prisma/client'