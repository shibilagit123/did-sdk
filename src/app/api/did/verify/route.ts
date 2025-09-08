import { NextResponse } from 'next/server'
import { DID } from 'dids'
import * as KeyResolver from 'key-did-resolver'

export const runtime = 'nodejs'

// export async function POST(req: Request) {
//   try {
//     const { did, jws } = await req.json()
//     if (!did || !jws) {
//       return NextResponse.json({ error: 'missing did or jws' }, { status: 400 })
//     }
//     const verifier = new DID({ resolver: KeyResolver.getResolver() })
//     const result = await verifier.verifyJWS(jws)

//     // decode base64url payload
//     const b64 = (s: string) => {
//       s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='
//       return Buffer.from(s, 'base64').toString('utf8')
//     }
//     const payload = JSON.parse(b64(result.payload as unknown as string))
//     if (!payload.challenge) return NextResponse.json({ error: 'no challenge' }, { status: 401 })

//     return NextResponse.json({ ok: true, did, browserDataAccepted: !!payload.browserDataHash })
//   } catch (e: any) {
//     return NextResponse.json({ error: 'verification failed', detail: e?.message || String(e) }, { status: 401 })
//   }
// }
// import { DID } from 'dids'
// import * as KeyResolver from 'key-did-resolver'
// import { decodeJwsPayload } from 'did-jwt'
// import { decodeJwsPayload } from 'did-jwt'
export async function POST(req: Request) {
  try {
    const { did, jws } = await req.json()
    if (!did || !jws) return NextResponse.json({ error: 'missing did or jws' }, { status: 400 })

    const verifier = new DID({ resolver: KeyResolver.getResolver() })
    const result = await verifier.verifyJWS(jws)

    // 👇 this was failing before
    const payload = decodeJwsPayload(result.payload)

    if (!payload?.challenge) {
      return NextResponse.json({ error: 'no challenge' }, { status: 401 })
    }
    // if you implemented single-use TTL challenges, check them here:
    // if (!consumeChallenge(payload.challenge)) return NextResponse.json({ error: 'invalid or expired challenge' }, { status: 401 })

    return NextResponse.json({ ok: true, did, browserDataAccepted: !!payload.browserDataHash })
  } catch (e: any) {
    return NextResponse.json({ error: 'verification failed', detail: e?.message || String(e) }, { status: 401 })
  }
}
