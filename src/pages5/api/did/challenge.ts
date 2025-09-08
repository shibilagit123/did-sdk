import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes } from 'crypto'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  res.status(200).json({ challenge: randomBytes(16).toString('hex'), ttlMs: 120000 })
}
