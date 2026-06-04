import type { RequestHandler } from 'express'
import { Router } from 'express'
import type { ReservationController } from '../controllers/ReservationController.js'

export function reservationRoutes(controller: ReservationController): Router {
    const router = Router()
    const wrap = (handler: RequestHandler): RequestHandler => {
        return (request, response, next): void => {
            void Promise.resolve(handler(request, response, next)).catch(next)
        }
    }

    router.get('/spaces', wrap(controller.listSpaces))
    router.get('/spaces/:id/availability', wrap(controller.checkAvailability))
    router.post('/', wrap(controller.createReservation))
    router.get('/my', wrap(controller.listMyReservations))
    router.get('/pending', wrap(controller.listPendingReservations))
    router.delete('/:id/cancel', wrap(controller.cancelReservation))
    router.patch('/:id/review', wrap(controller.reviewReservation))
    router.get('/:id', wrap(controller.getReservationDetail))

    return router
}
