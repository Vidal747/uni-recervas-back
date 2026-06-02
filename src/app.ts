import express, {
    type NextFunction,
    type Request,
    type Response
} from 'express'
import { AppError } from './errors/AppError.js'
import { ReservationModuleFactory } from './factories/ReservationModuleFactory.js'
import { reservationRoutes } from './routes/reservationRoutes.js'

export function createApp(): express.Express {
    const app = express()
    const controller = ReservationModuleFactory.createController()

    app.use(express.json())
    app.use('/reservations', reservationRoutes(controller))

    app.use(
        (
            error: unknown,
            _request: Request,
            response: Response,
            _next: NextFunction
        ) => {
            if (error instanceof AppError) {
                response.status(error.statusCode).json({ error: error.message })
                return
            }

            const message =
                error instanceof Error ? error.message : 'Unexpected error'
            response.status(500).json({ error: message })
        }
    )

    return app
}
