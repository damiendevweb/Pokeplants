import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY

app.use(express.static(join(__dirname, 'dist')))

app.use('/api/plantnet', async (req, res) => {
  const separator = req.url.includes('?') ? '&' : '?'
  const targetUrl = `https://my-api.plantnet.org${req.url}${separator}api-key=${PLANTNET_API_KEY}`

  try {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const bodyBuffer = Buffer.concat(chunks)

    const headers = {}
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type']
    }
    headers['accept'] = 'application/json'

    console.log('PlantNet targetUrl:', targetUrl)
    console.log('PLANTNET_API_KEY exists:', !!PLANTNET_API_KEY)
    console.log('PLANTNET_API_KEY length:', PLANTNET_API_KEY?.length)

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? bodyBuffer : undefined,
    })

    const responseBuffer = Buffer.from(await response.arrayBuffer())

    res.status(response.status)

    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('content-type', contentType)
    }

    res.send(responseBuffer)
  } catch (err) {
    console.error('PlantNet proxy error:', err)
    res.status(502).json({
      error: 'Proxy error',
      details: err instanceof Error ? err.message : String(err),
    })
  }
})

app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`PokePlants running on port ${PORT}`)
})