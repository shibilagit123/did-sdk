import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export const runtime = 'nodejs'

export async function POST() {
  const challenge = randomBytes(16).toString('hex')
  const ttlMs = 120000
  return NextResponse.json({ challenge, ttlMs })
}
