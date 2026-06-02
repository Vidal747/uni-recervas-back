export class AppError extends Error {
    private readonly _statusCode: number

    public constructor(statusCode: number, message: string) {
        super(message)
        this._statusCode = statusCode
        this.name = 'AppError'
    }

    public get statusCode(): number {
        return this._statusCode
    }
}
