import type { NextApiRequest, NextApiResponse } from 'next'
import { buyerLogin, buyerRegister } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { action, username, password, teamName } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    // Handle registration
    if (action === 'register') {
      if (!teamName) {
        return res.status(400).json({ message: 'Team name is required for registration' })
      }
      
      const buyer = await buyerRegister(username, password, teamName)
      return res.status(201).json({ 
        message: 'Buyer registered successfully', 
        buyer: { id: buyer.id, username: buyer.username, teamName: buyer.teamName } 
      })
    }
    
    // Handle login
    if (action === 'login') {
      const token = await buyerLogin(username, password)
      return res.status(200).json({ message: 'Login successful', token })
    }

    // If action is neither register nor login
    return res.status(400).json({ message: 'Invalid action' })
  } catch (error) {
    console.error('Buyer auth error:', error)
    return res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
}