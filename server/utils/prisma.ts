/**
 * @file prisma
 * @description Shared Prisma client singleton using the pg driver adapter.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { PrismaClient } from '~/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
