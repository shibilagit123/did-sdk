'use client'

import { useState } from 'react'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import * as KeyResolver from 'key-did-resolver'

// --- minimal browser signals (customize as needed)
function getBrowserData() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: { w: screen.width, h: screen.height, dpr: window.devicePixelRatio },
  }
}

// base64url helper
function b64url(buf: ArrayBuffer) {
  const bin = String.fromCharCode(...new Uint8Array(buf))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// SHA-256 hash of JSON
async function hashBrowserData(data: any) {
  const text = JSON.stringify(data)
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return b64url(digest)
}

// Create/load a DID (demo: store seed in localStorage; use IndexedDB/KMS in prod)
async function loadOrCreateDID() {
  let seedHex = localStorage.getItem('did_seed_hex')
  if (!seedHex) {
    const seed = new Uint8Array(32)
    crypto.getRandomValues(seed)
    seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem('did_seed_hex', seedHex)
  }
  const seed = new Uint8Array(seedHex.match(/.{1,2}/g)!.map(h => parseInt(h, 16)))
  const did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: KeyResolver.getResolver(),
  })
  await did.authenticate()
  return did
}

export default function Home() {
  const [log, setLog] = useState<string>('Ready.')
  const push = (msg: string) => setLog(prev => `${prev}\n${msg}`)

  async function runAttestation() {
    try {
      setLog('Requesting challenge...')
      const { challenge } = await fetch('/api/did/challenges', { method: 'POST' }).then(r => r.json())

      const data = getBrowserData()
      const browserDataHash = await hashBrowserData(data)

      const did = await loadOrCreateDID()
      push(`DID: ${did.id}`)

      const jws = await did.createJWS({ challenge, browserDataHash })

      setLog(l => l + '\nVerifying on server...')
      const res = await fetch('/api/did/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ did: did.id, jws }),
      }).then(r => r.json())

      push('Server response: ' + JSON.stringify(res, null, 2))
    } catch (e: any) {
      push('Error: ' + (e?.message || String(e)))
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '4rem auto', fontFamily: 'system-ui' }}>
      <h1>DID Browser Attestation Demo</h1>
      <p>This will hash minimal browser info and sign it with your DID (Ed25519).</p>
      <button onClick={runAttestation} style={{ padding: '10px 16px', borderRadius: 8 }}>
        Attest this browser
      </button>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#0f0', padding: 16, borderRadius: 8, marginTop: 16 }}>
        {log}
      </pre>
    </main>
  )
}
