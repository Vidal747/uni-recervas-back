import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function loadEnvFile(): void {
    const envPath = resolve(process.cwd(), '.env')

    if (!existsSync(envPath)) {
        return
    }

    const content = readFileSync(envPath, 'utf8')

    for (const line of content.split('\n')) {
        const trimmed = line.trim()

        if (trimmed.length === 0 || trimmed.startsWith('#')) {
            continue
        }

        const separatorIndex = trimmed.indexOf('=')

        if (separatorIndex === -1) {
            continue
        }

        const key = trimmed.slice(0, separatorIndex).trim()
        const value = trimmed.slice(separatorIndex + 1).trim()

        if (process.env[key] === undefined) {
            process.env[key] = value
        }
    }
}
