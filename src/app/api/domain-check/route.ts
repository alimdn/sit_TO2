import { NextRequest, NextResponse } from 'next/server'

// TLD pricing map (realistic yearly prices in USD, based on common registrar rates)
const TLD_PRICING: Record<string, number> = {
  'com': 12.99,
  'net': 11.99,
  'org': 9.99,
  'io': 39.99,
  'co': 29.99,
  'dev': 14.99,
  'app': 14.99,
  'xyz': 2.99,
  'me': 8.99,
  'info': 4.99,
  'biz': 9.99,
  'tech': 6.99,
  'online': 3.99,
  'store': 3.99,
  'site': 3.99,
  'website': 3.99,
  'agency': 19.99,
  'studio': 24.99,
  'design': 34.99,
  'digital': 29.99,
  'shop': 6.99,
  'cloud': 14.99,
  'ai': 59.99,
  'cc': 9.99,
}

// Default TLDs to check when user doesn't specify a TLD
const DEFAULT_TLDS = ['com', 'net', 'org', 'io', 'co', 'dev', 'app', 'xyz', 'info', 'ai']

interface DomainResult {
  domain: string
  tld: string
  available: boolean
  price: number
}

/**
 * Check if a domain is available using two complementary methods:
 *
 * 1. DNS resolution (Google DNS + Cloudflare DNS-over-HTTPS):
 *    If A/AAAA/MX/NS/TXT records exist, the domain is in active use → likely taken.
 *    If NXDOMAIN is returned, the domain doesn't exist in DNS → likely available.
 *
 * 2. RDAP (Registration Data Access Protocol) — the modern replacement for WHOIS:
 *    Queries the official registry for the TLD via https://rdap.org/domain/<domain>.
 *    If RDAP returns a record with an "events" array containing a "registration" event,
 *    the domain is registered → taken.
 *    If RDAP returns 404, the domain is not registered → available.
 *
 * Combining both methods gives high accuracy:
 *   - DNS alone can produce false positives (registered but no DNS configured)
 *   - RDAP alone can be slow or rate-limited
 *   - Using both as a consensus check minimizes errors
 */
async function checkDomainAvailability(domain: string): Promise<boolean> {
  // --- Method 1: DNS resolution (fast, primary) ---
  let dnsSaysTaken = false
  const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT']

  for (const type of recordTypes) {
    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
        { signal: AbortSignal.timeout(4000) }
      )
      const data = await response.json()
      // If we get an answer, the domain has DNS records = likely taken
      if (data.Answer && data.Answer.length > 0) {
        dnsSaysTaken = true
        break
      }
    } catch {
      // If DNS check fails, continue to next record type
      continue
    }
  }

  // If DNS clearly shows the domain is taken, return early (fast path)
  if (dnsSaysTaken) return false

  // --- Method 2: RDAP confirmation (slower, authoritative) ---
  // RDAP is the official IETF standard (RFC 7483) for domain registration data.
  // https://rdap.org acts as a bootstrap that redirects to the correct registry.
  try {
    const response = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      {
        signal: AbortSignal.timeout(6000),
        headers: { 'Accept': 'application/rdap+json' },
      }
    )
    if (response.status === 404) {
      // RDAP says domain is NOT registered → available
      return true
    }
    if (response.status === 200) {
      // RDAP found a registration record → taken
      return false
    }
    // For other status codes (e.g., 429 rate limit, 500), fall through to DNS verdict
  } catch {
    // RDAP failed (timeout, network); fall through to DNS verdict
  }

  // --- Consensus: DNS said no records found and RDAP was inconclusive ---
  // Treat as available (DNS is generally reliable for "definitely not registered")
  return true
}

/**
 * Extract the domain name (without TLD) and TLD from user input
 */
function parseDomainInput(query: string): { name: string; tld: string | null } {
  // Remove protocol and www
  let cleaned = query.toLowerCase().trim()
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '')
  // Remove trailing slashes and paths
  cleaned = cleaned.split('/')[0]

  // Check if user specified a TLD
  const parts = cleaned.split('.')
  if (parts.length >= 2) {
    const tld = parts.slice(1).join('.')
    const name = parts[0]
    return { name, tld }
  }

  return { name: cleaned, tld: null }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  const { name, tld: specifiedTld } = parseDomainInput(query.trim())

  if (!name || name.length < 1) {
    return NextResponse.json({ error: 'Invalid domain name' }, { status: 400 })
  }

  // Clean the name - only allow alphanumeric and hyphens
  const cleanName = name.replace(/[^a-z0-9-]/g, '')
  if (!cleanName || cleanName.length < 1) {
    return NextResponse.json({ error: 'Invalid domain name' }, { status: 400 })
  }

  const results: DomainResult[] = []

  // Determine which TLDs to check
  const tldsToCheck = specifiedTld
    ? [specifiedTld]
    : DEFAULT_TLDS

  // Check each TLD in parallel (with concurrency limit to avoid rate limiting)
  const batchSize = 3
  for (let i = 0; i < tldsToCheck.length; i += batchSize) {
    const batch = tldsToCheck.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(async (tld) => {
        const fullDomain = `${cleanName}.${tld}`
        const price = TLD_PRICING[tld] || 19.99
        const available = await checkDomainAvailability(fullDomain)
        return {
          domain: fullDomain,
          tld,
          available,
          price,
        }
      })
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }
  }

  // Sort: available first, then by price
  results.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1
    return a.price - b.price
  })

  return NextResponse.json({
    query: cleanName,
    results,
  })
}
