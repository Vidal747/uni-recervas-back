import { createApp } from './app.js'

const port = 3000

const app = createApp()

app.listen(port, () => {
    process.stdout.write(`Server listening on port ${port}\n`)
})
