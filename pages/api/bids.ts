import type { NextApiRequest, NextApiResponse } from 'next'
import { placeBid, finalizePlayerSale } from '../../lib/players'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    const { action, playerId, bidAmount } = req.body

    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' })
    }

    if (action === 'place') {
      if (!bidAmount || isNaN(bidAmount)) {
        return res.status(400).json({ message: 'Valid bid amount is required' })
      }

      try {
        const updatedPlayer = await placeBid(token, playerId, Number(bidAmount))
        return res.status(200).json({ message: 'Bid placed successfully', player: updatedPlayer })
      } catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to place bid' })
      }
    }

    if (action === 'finalize') {
      try {
        const soldPlayer = await finalizePlayerSale(token, playerId)
        return res.status(200).json({ message: 'Player sale finalized', player: soldPlayer })
      } catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to finalize sale' })
      }
    }

    return res.status(400).json({ message: 'Invalid action' })
  } catch (error) {
    console.error('Bids API error:', error)
    return res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
}
