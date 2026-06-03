export type SmsConfig = {
    readonly enabled: boolean
    readonly apiUrl: string
    readonly bearerToken: string
    readonly companyId: string
    readonly authTokenEmpresa: string
}

export function loadSmsConfig(): SmsConfig {
    const bearerToken = process.env.SMS_BEARER_TOKEN ?? ''

    return {
        enabled: bearerToken.length > 0,
        apiUrl:
            process.env.SMS_API_URL ??
            'http://sms-manager.cuenti.co/api/send-messages',
        bearerToken,
        companyId: process.env.SMS_COMPANY_ID ?? '2',
        authTokenEmpresa: process.env.SMS_AUTH_TOKEN_EMPRESA ?? '2'
    }
}
