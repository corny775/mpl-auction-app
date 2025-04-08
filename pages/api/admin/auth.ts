import type { NextApiRequest, NextApiResponse } from 'next'
import { adminLogin, adminRegister } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { action, username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    // Handle registration
    if (action === 'register') {
      const admin = await adminRegister(username, password)
      return res.status(201).json({ message: 'Admin registered successfully', admin: { id: admin.id, username: admin.username } })
    }
    
    // Handle login
    if (action === 'login') {
      const token = await adminLogin(username, password)
      return res.status(200).json({ message: 'Login successful', token })
    }

    // If action is neither register nor login
    return res.status(400).json({ message: 'Invalid action' })
  } catch (error) {
    console.error('Admin auth error:', error)
    return res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
}