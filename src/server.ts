import { createApp } from './app.js'
import { loadEnvFile } from './config/env.js'

loadEnvFile()

const port = 3000

const app = createApp()

app.listen(port, () => {
    process.stdout.write(`Server listening on port ${port}\n`)
})
