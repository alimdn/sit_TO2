import { NextRequest, NextResponse } from 'next/server'
import { create as createArchive } from 'archiver'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const target = searchParams.get('target') || 'project'

  const projectRoot = path.resolve(process.cwd())
  const srcDir = path.join(projectRoot, 'src')

  const archive = createArchive('zip', { zlib: { level: 9 } })

  const chunks: Buffer[] = []
  const stream = new Readable({
    read() {}
  })

  archive.on('data', (chunk: Buffer) => {
    chunks.push(chunk)
  })

  const promise = new Promise<Buffer>((resolve, reject) => {
    archive.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    archive.on('error', reject)
  })

  if (target === 'project') {
    // Full project without node_modules, .next, .git
    archive.glob('**/*', {
      cwd: projectRoot,
      ignore: [
        'node_modules/**',
        '.next/**',
        '.git/**',
        'prisma/*.db',
        'prisma/*.db-journal',
      ],
      dot: false,
    })
  } else if (target === 'src') {
    // Source code only
    archive.directory(srcDir, 'src')
  } else if (target === 'components') {
    const compDir = path.join(srcDir, 'components')
    archive.directory(compDir, 'components')
  } else if (target === 'api') {
    const apiDir = path.join(srcDir, 'app', 'api')
    archive.directory(apiDir, 'api')
  }

  archive.finalize()

  const buffer = await promise

  const filenames: Record<string, string> = {
    project: 'webflowsub-project',
    src: 'webflowsub-source',
    components: 'webflowsub-components',
    api: 'webflowsub-api-routes',
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filenames[target] || 'download'}.zip"`,
      'Content-Length': buffer.length.toString(),
    },
  })
}
