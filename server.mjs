import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(join(__dirname, 'dist')))

app.use('/api/plantnet', async (req, res) => {
  const targetUrl = `https://my-api.plantnet.org${req.url}`

  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers, host: 'my-api.plantnet.org' },
    }

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = await new Promise((resolve) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => resolve(Buffer.concat(chunks)))
      })
    }

    const response = await fetch(targetUrl, fetchOptions)

    res.status(response.status)
    response.headers.forEach((value, key) => {
      if (key !== 'transfer-encoding') res.setHeader(key, value)
    })

    const body = Buffer.from(await response.arrayBuffer())
    res.send(body)
  } catch (err) {
    console.error('PlantNet proxy error:', err)
    res.status(502).json({ error: 'Proxy error' })
  }
})

app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`PokePlants running on port ${PORT}`)
})
