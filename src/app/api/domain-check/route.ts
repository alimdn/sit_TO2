import { NextRequest, NextResponse } from 'next/server'

interface DomainResult {
  domain: string
  available: boolean
  price: number
  tld: string
  currency: string
}

const TLD_PRICING: Record<string, number> = {
  '.com': 12.99,
  '.net': 11.99,
  '.org': 10.99,
  '.io': 39.99,
  '.co': 29.99,
  '.dev': 14.99,
  '.app': 14.99,
  '.tech': 9.99,
  '.store': 9.99,
  '.site': 8.99,
  '.online': 7.99,
  '.xyz': 3.99,
  '.me': 15.99,
  '.info': 6.99,
  '.biz': 11.99,
  '.us': 10.99,
  '.cc': 19.99,
  '.tv': 39.99,
  '.ai': 79.99,
  '.cloud': 9.99,
  '.digital': 7.99,
  '.agency': 9.99,
  '.studio': 14.99,
  '.design': 29.99,
  '.shop': 9.99,
  '.club': 9.99,
}

function dnsLookup(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    import('dns').then((dns) => {
      dns.resolve4(hostname, (err: NodeJS.ErrnoException | null, addresses: string[]) => {
        if (err) {
          // Try resolving as CNAME or other record types
          dns.resolve(hostname, (err2: NodeJS.ErrnoException | null, records: string[]) => {
            if (err2) {
              resolve([])
            } else {
              resolve(records)
            }
          })
        } else {
          resolve(addresses)
        }
      })
    })
  })
}

async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const records = await dnsLookup(domain)
    if (records.length > 0) return false // Domain has DNS records, likely taken

    // Also check NS records (some domains have no A records but have nameservers)
    const nsLookup = (): Promise<string[]> => {
      return new Promise((resolve) => {
        import('dns').then((dns) => {
          dns.resolveNs(domain, (err: NodeJS.ErrnoException | null, addresses: string[]) => {
            if (err) resolve([])
            else resolve(addresses)
          })
        })
      })
    }

    const nsRecords = await nsLookup()
    return nsRecords.length === 0 // No NS records = likely available
  } catch {
    return true // If we can't check, assume available
  }
}

function extractTld(domain: string): string {
  const parts = domain.split('.')
  if (parts.length >= 2) {
    return '.' + parts.slice(-1).join('')
  }
  return '.com'
}

function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  // Remove protocol
  domain = domain.replace(/^https?:\/\//, '')
  // Remove www
  domain = domain.replace(/^www\./, '')
  // Remove trailing slashes and paths
  domain = domain.split('/')[0]
  return domain
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter a domain name' }, { status: 400 })
  }

  const normalizedQuery = normalizeDomain(query)

  // Check if it looks like a full domain (has a TLD)
  const hasTld = normalizedQuery.includes('.')
  const tld = hasTld ? '.' + normalizedQuery.split('.').pop() : '.com'

  const results: DomainResult[] = []

  if (hasTld) {
    // User entered a specific domain
    const available = await checkDomainAvailability(normalizedQuery)
    const price = TLD_PRICING[tld] || 12.99
    results.push({
      domain: normalizedQuery,
      available,
      price,
      tld,
      currency: 'USD',
    })

    // Also suggest alternatives with other TLDs
    const baseName = normalizedQuery.split('.')[0]
    const suggestTlds = Object.keys(TLD_PRICING).filter(t => t !== tld).slice(0, 4)
    for (const stld of suggestTlds) {
      const altDomain = baseName + stld
      const altAvailable = await checkDomainAvailability(altDomain)
      results.push({
        domain: altDomain,
        available: altAvailable,
        price: TLD_PRICING[stld],
        tld: stld,
        currency: 'USD',
      })
    }
  } else {
    // User entered just a name, search across popular TLDs
    const baseName = normalizedQuery
    const popularTlds = ['.com', '.net', '.org', '.io', '.co', '.dev', '.app', '.tech', '.store', '.site']
    for (const stld of popularTlds) {
      const domain = baseName + stld
      const available = await checkDomainAvailability(domain)
      results.push({
        domain,
        available,
        price: TLD_PRICING[stld] || 12.99,
        tld: stld,
        currency: 'USD',
      })
    }
  }

  return NextResponse.json({ results, query: normalizedQuery })
}
