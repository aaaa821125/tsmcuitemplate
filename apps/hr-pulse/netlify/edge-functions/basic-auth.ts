// basic-auth.ts — FREE password protection for the HR Pulse site (Netlify Edge Function).
//
// Copied from the repo-root `netlify/edge-functions/basic-auth.ts` pattern (same rationale:
// Netlify's built-in Dashboard password protection and `_headers` Basic-Auth are Pro-only;
// an Edge Function is the free-tier path, works on the default `.netlify.app` URL, no custom
// domain needed). This copy reads its own env var (`HR_PULSE_BASIC_AUTH`) so HR Pulse credentials
// are independent from the Storybook site's `STORYBOOK_BASIC_AUTH`.
//
// Policy is fail-closed: unset or malformed HR_PULSE_BASIC_AUTH = 503 (site locked), never a
// silent public pass-through.
//
// To enable (30 seconds, free):
//   Netlify → Site configuration → Environment variables → Add a variable
//     Key:   HR_PULSE_BASIC_AUTH
//     Value: your_user:your_password          (multiple pairs space-separated: "alice:pw1 bob:pw2")
//   Next deploy → the site prompts a native browser Basic Auth dialog.
//
// netlify.toml wires this via: [[edge_functions]] path="/*" function="basic-auth"

export const HR_PULSE_ACCESS_POLICY = 'fail-closed-v1'
export const HR_PULSE_AUTH_MISCONFIGURED_STATUS = 503
export const HR_PULSE_AUTH_REQUIRED_STATUS = 401

const MAX_CREDENTIAL_ENTRIES = 32
const MAX_CREDENTIAL_ENTRY_LENGTH = 1024
const MAX_AUTHORIZATION_HEADER_LENGTH = 2048
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/

const misconfigured = (): Response =>
  new Response('Authentication service unavailable.', {
    status: HR_PULSE_AUTH_MISCONFIGURED_STATUS,
    headers: { 'cache-control': 'no-store' },
  })

const challenge = (): Response =>
  new Response('Authentication required.', {
    status: HR_PULSE_AUTH_REQUIRED_STATUS,
    headers: {
      'cache-control': 'no-store',
      'www-authenticate': 'Basic realm="HR Pulse", charset="UTF-8"',
    },
  })

function parseConfiguredCredentials(rawCredentials: unknown): Set<string> | null {
  if (typeof rawCredentials !== 'string') return null
  const trimmed = rawCredentials.trim()
  if (!trimmed) return null
  const entries = trimmed.split(/\s+/)
  if (entries.length > MAX_CREDENTIAL_ENTRIES) return null
  const allowed = new Set<string>()
  for (const entry of entries) {
    if (entry.length > MAX_CREDENTIAL_ENTRY_LENGTH) return null
    if (CONTROL_CHARACTERS.test(entry)) return null
    const separator = entry.indexOf(':')
    if (separator <= 0 || separator === entry.length - 1) return null
    allowed.add(entry)
  }
  return allowed
}

function decodeAuthorization(header: string): string | null {
  if (!header || header.length > MAX_AUTHORIZATION_HEADER_LENGTH) return null
  const separator = header.indexOf(' ')
  if (separator <= 0 || header.slice(0, separator).toLowerCase() !== 'basic') return null
  const encoded = header.slice(separator + 1).trim()
  if (!encoded) return null
  try {
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    if (CONTROL_CHARACTERS.test(decoded) || !decoded.includes(':')) return null
    return decoded
  } catch {
    return null
  }
}

export function enforceHrPulseBasicAuth(request: Request, rawCredentials: unknown): Response | undefined {
  const allowed = parseConfiguredCredentials(rawCredentials)
  if (!allowed) return misconfigured()
  const decoded = decodeAuthorization(request.headers.get('authorization') ?? '')
  if (decoded !== null && allowed.has(decoded)) return undefined
  return challenge()
}

export default function basicAuth(request: Request): Response | undefined {
  let rawCredentials: unknown
  try {
    rawCredentials = (globalThis as { Deno?: { env: { get(name: string): string | undefined } } })
      .Deno?.env.get('HR_PULSE_BASIC_AUTH')
  } catch {
    return misconfigured()
  }
  return enforceHrPulseBasicAuth(request, rawCredentials)
}
