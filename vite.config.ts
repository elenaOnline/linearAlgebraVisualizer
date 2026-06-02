import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

function feedbackPlugin(): Plugin {
  return {
    name: 'feedback-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__feedback', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks).toString('utf-8')
            const data = JSON.parse(body) as {
              note: string
              scope: string
              priority: string
              route: string
              elementDesc: string
            }
            const file = resolve(process.cwd(), 'pre-dev/problems.md')
            if (!existsSync(file)) {
              writeFileSync(file, '# Feedback Log\n\n## Open\n\n## Heard\n')
            }
            const content = readFileSync(file, 'utf-8')
            const ids = [...content.matchAll(/\[FB-(\d+)\]/g)].map((m) =>
              parseInt(m[1], 10),
            )
            const next = ids.length ? Math.max(...ids) + 1 : 1
            const id = `FB-${String(next).padStart(3, '0')}`
            const date = new Date().toISOString().slice(0, 10)
            const entry = [
              `### [${id}] ${date} — ${data.scope} — ${data.priority}`,
              `**Route:** ${data.route}`,
              `**Element:** ${data.elementDesc}`,
              `**Note:** ${data.note}`,
              '',
            ].join('\n')
            const updated = content.replace('## Open\n', `## Open\n\n${entry}`)
            writeFileSync(file, updated)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, id }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), feedbackPlugin()],
  base: '/linearAlgebraVisualizer/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          katex: ['katex'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
