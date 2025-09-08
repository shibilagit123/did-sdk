import type { NextApiRequest, NextApiResponse } from 'next'
import { DID } from 'dids'
import * as KeyResolver from 'key-did-resolver'

function b64urlToJSON(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='
  return JSON.parse(Buffer.from(s, 'base64').toString('utf8'))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  try {
    const { did, jws } = req.body || {}
    if (!did || !jws) return res.status(400).json({ error: 'missing did or jws' })

    const verifier = new DID({ resolver: KeyResolver.getResolver() })
    const result = await verifier.verifyJWS(jws)
    const payload = b64urlToJSON(result.payload as unknown as string)
    if (!payload.challenge) return res.status(401).json({ error: 'no challenge' })

    res.status(200).json({ ok: true, did, browserDataAccepted: !!payload.browserDataHash })
  } catch (e: any) {
    res.status(401).json({ error: 'verification failed', detail: e?.message || String(e) })
  }
}
