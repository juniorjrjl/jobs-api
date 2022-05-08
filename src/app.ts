import dotenv from 'dotenv'
import { router } from './routes'

dotenv.config()

import express from 'express'

const app = express()

app.use(express.json())

app.use(router)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('started!'))