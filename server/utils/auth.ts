/**
 * @file auth
 * @description Admin password hashing (bcrypt) and signed session-cookie helpers.
 *
 * @status None
 * @issues None
 * @todo None
 */
import bcrypt from 'bcryptjs'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { prisma } from '~~/server/utils/prisma'

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dev-admin-session-secret'
}

export function createSessionToken(adminId: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = `${adminId}.${expiresAt}`
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const adminIdStr = parts[0]!
  const expiresAtStr = parts[1]!
  const signature = parts[2]!
  const payload = `${adminIdStr}.${expiresAtStr}`
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || Date.now() / 1000 > expiresAt) return null

  const adminId = Number(adminIdStr)
  return Number.isInteger(adminId) ? adminId : null
}

export function getSessionAdminId(event: H3Event): number | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  return verifySessionToken(token)
}

export async function requireAdmin(event: H3Event): Promise<number> {
  const adminId = getSessionAdminId(event)
  if (!adminId) {
    throw createError({ statusCode: 401, statusMessage: 'لطفاً وارد شوید' })
  }
  const admin = await prisma.admin.findUnique({ where: { id: adminId } })
  if (!admin) {
    throw createError({ statusCode: 401, statusMessage: 'لطفاً وارد شوید' })
  }
  return adminId
}

export function setSessionCookie(event: H3Event, adminId: number): void {
  const token = createSessionToken(adminId)
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS,
    path: '/'
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
