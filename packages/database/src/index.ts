
import "dotenv/config"
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 1. Load your connection string
console.log("DATABASE_URL:", process.env.DATABASE_URL)
const connectionString = process.env.DATABASE_URL

// 2. Create the driver adapter
const pool = new Pool({ connectionString })
// Prisma adapter typings can disagree with the installed `pg` Pool types.
const adapter = new PrismaPg(pool as any)

// 3. Pass the adapter to the PrismaClient
export const db = new PrismaClient({ adapter })
export * from '@prisma/client'

export {
    createPolicy,
    getPoliciesByCompany,
    updatePolicy,
    updatePolicyContent,
} from "./policy";
export { parseSections } from "./parseSections";
export {
    saveAdditionalData,
    getCompanyInfo,
} from "./company";
export {
    notify,
    notifyPolicyCreated,
    notifyPolicyStatusChanged,
    notifyPolicyRefined,
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    countUnreadNotifications,
} from "./notifications";
export type { NotifyInput } from "./notifications";
