import type { SmsConfig } from '../config/sms.js'

export class SmsClient {
    public constructor(private readonly config: SmsConfig) {}

    public async sendMessage(toPhone: string, body: string): Promise<void> {
        if (!this.config.enabled) {
            return
        }

        const normalizedPhone = toPhone.trim()

        if (normalizedPhone.length === 0) {
            return
        }

        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.config.bearerToken}`,
                'X-Auth-Token-Empresa': this.config.authTokenEmpresa,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                companyId: this.config.companyId,
                storageType: 'queue',
                message: {
                    type: '2',
                    to: [normalizedPhone],
                    body
                }
            })
        })

        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(
                `SMS API responded with ${response.status}: ${errorBody}`
            )
        }
    }
}
