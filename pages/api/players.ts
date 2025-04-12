import type { NextApiRequest, NextApiResponse } from 'next'
import { generateRandomPlayer, getAllPlayers, getUnsoldPlayers, getSoldPlayers } from '../../lib/players'
import { verifyToken } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET request for fetching players
    if (req.method === 'GET') {
      const { status } = req.query

      // Filter players based on status query parameter
      if (status === 'unsold') {
        const players = await getUnsoldPlayers()
        return res.status(200).json(players)
      } else if (status === 'sold') {
        const players = await getSoldPlayers()
        return res.status(200).json(players)
      } else {
        // Default: get all players
        const players = await getAllPlayers()
        return res.status(200).json(players)
      }
    }
    
    // POST request for generating a random player
    if (req.method === 'POST') {
      // Verify admin token for player generation
      const token = req.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return res.status(401).json({ message: 'No authorization token provided' })
      }
      
      try {
        const decoded = verifyToken(token)
        
        if (decoded.role !== 'admin') {
          return res.status(403).json({ message: 'Only admin can generate players' })
        }
        
        const player = await generateRandomPlayer()
        return res.status(201).json(player)
      } catch (error) {
        console.error('Token verification failed:', error)
        return res.status(401).json({ message: 'Invalid token' })
      }
    }
    
    // For any other HTTP method
    return res.status(405).json({ message: 'Method Not Allowed' })
  } catch (error) {
    console.error('Players API error:', error)
    return res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
}
