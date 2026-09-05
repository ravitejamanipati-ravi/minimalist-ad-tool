import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import productRouter from './routes/product.js'
import generateRouter from './routes/generate.js'
import scoreRouter from './routes/score.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/product', productRouter)
app.use('/api/generate', generateRouter)
app.use('/api/score', scoreRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server on :${PORT}`))
