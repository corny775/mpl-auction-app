import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Define JWT payload structure
export interface JwtPayload {
  id: string;
  role: string;
  teamName?: string; // Optional for admin tokens
}

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'

export async function adminRegister(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return prisma.admin.create({
    data: {
      username,
      password: hashedPassword
    }
  })
}

export async function adminLogin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } })
  if (!admin) throw new Error('Admin not found')

  const isValid = await bcrypt.compare(password, admin.password)
  if (!isValid) throw new Error('Invalid password')

  return jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' })
}

export async function buyerRegister(username: string, password: string, teamName: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return prisma.buyer.create({
    data: {
      username,
      password: hashedPassword,
      teamName
    }
  })
}

export async function buyerLogin(username: string, password: string) {
  const buyer = await prisma.buyer.findUnique({ where: { username } })
  if (!buyer) throw new Error('Buyer not found')

  const isValid = await bcrypt.compare(password, buyer.password)
  if (!isValid) throw new Error('Invalid password')

  return jwt.sign({ id: buyer.id, role: 'buyer', teamName: buyer.teamName }, JWT_SECRET, { expiresIn: '1h' })
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    throw new Error('Invalid or expired token')
  }
}
