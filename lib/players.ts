import { PrismaClient } from '@prisma/client'
import { verifyToken, JwtPayload } from './auth'

const prisma = new PrismaClient()

// List of player names for random selection
const playerNames = [
  'Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'KL Rahul', 
  'Jasprit Bumrah', 'Hardik Pandya', 'Ravindra Jadeja', 
  'AB de Villiers', 'Chris Gayle', 'David Warner'
]

const playerRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']

export async function generateRandomPlayer() {
  const randomName = playerNames[Math.floor(Math.random() * playerNames.length)]
  const randomRole = playerRoles[Math.floor(Math.random() * playerRoles.length)]
  const basePrice = Math.floor(Math.random() * (20000000 - 2000000 + 1)) + 2000000 // ₹20 Cr to ₹2 Cr

  return prisma.player.create({
    data: {
      name: randomName,
      role: randomRole,
      basePrice: basePrice
    }
  })
}

export async function placeBid(token: string, playerId: string, bidAmount: number) {
  const decoded = verifyToken(token);
  
  if (decoded.role !== 'buyer') {
    throw new Error('Only buyers can place bids')
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player) throw new Error('Player not found')
  
  if (player.isSold) throw new Error('Player already sold')
  
  if (bidAmount <= player.currentBid) {
    throw new Error('Bid amount must be higher than current bid')
  }

  // Create the bid record
  await prisma.bid.create({
    data: {
      playerId,
      buyerId: decoded.id,
      bidAmount
    }
  })

  // Update player's current bid and provisional team
  return prisma.player.update({
    where: { id: playerId },
    data: {
      currentBid: bidAmount,
      soldToTeam: decoded.teamName
    }
  })
}

export async function finalizePlayerSale(token: string, playerId: string) {
  const decoded = verifyToken(token);
  
  if (decoded.role !== 'admin') {
    throw new Error('Only admin can finalize sales')
  }

  return prisma.player.update({
    where: { id: playerId },
    data: {
      isSold: true
    }
  })
}

export async function getAllPlayers() {
  return prisma.player.findMany({
    orderBy: { currentBid: 'desc' }
  })
}

export async function getUnsoldPlayers() {
  return prisma.player.findMany({
    where: { isSold: false },
    orderBy: { currentBid: 'desc' }
  })
}

export async function getSoldPlayers() {
  return prisma.player.findMany({
    where: { isSold: true },
    orderBy: { currentBid: 'desc' }
  })
}