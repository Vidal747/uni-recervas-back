import type { Request, Response } from 'express'
import { AppError } from '../errors/AppError.js'
import type { ReservationFacade } from '../facade/ReservationFacade.js'

export class ReservationController {
    public constructor(private readonly facade: ReservationFacade) {}

    public listSpaces = async (
        _request: Request,
        response: Response
    ): Promise<void> => {
        const spaces = await this.facade.listSpaces()
        this.respondJson(response, spaces)
    }

    public checkAvailability = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const availability = await this.facade.checkAvailability(
            String(request.params.id),
            String(request.query.date)
        )
        this.respondJson(response, availability)
    }

    public createReservation = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const userId = this.requireUserId(request)
        const reservation = await this.facade.createReservation(userId, {
            spaceId: String(request.body.spaceId),
            date: String(request.body.date),
            startTime: String(request.body.startTime),
            endTime: String(request.body.endTime),
            purpose: String(request.body.purpose)
        })
        this.respondJson(response, reservation, 201)
    }

    public listMyReservations = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const userId = this.requireUserId(request)
        const reservations = await this.facade.listMyReservations(userId)
        this.respondJson(response, reservations)
    }

    public cancelReservation = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const userId = this.requireUserId(request)
        const reservation = await this.facade.cancelReservation(
            userId,
            String(request.params.id)
        )
        this.respondJson(response, reservation)
    }

    public reviewReservation = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const userId = this.requireUserId(request)
        const action = String(request.body.action) as 'approve' | 'reject'
        const observations =
            request.body.observations === undefined
                ? undefined
                : String(request.body.observations)
        const reservation = await this.facade.reviewReservation(
            userId,
            String(request.params.id),
            { action, observations }
        )
        this.respondJson(response, reservation)
    }

    public listPendingReservations = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const userId = this.requireUserId(request)
        const reservations = await this.facade.listPendingReservations(userId)
        this.respondJson(response, reservations)
    }

    public getReservationDetail = async (
        request: Request,
        response: Response
    ): Promise<void> => {
        const userId = this.requireUserId(request)
        const detail = await this.facade.getReservationDetail(
            userId,
            String(request.params.id)
        )
        this.respondJson(response, detail)
    }

    private requireUserId(request: Request): string {
        const userId = request.header('X-User-Id')

        if (!userId) {
            throw new AppError(400, 'X-User-Id header is required')
        }

        return userId
    }

    private respondJson<T>(
        response: Response,
        data: T,
        statusCode = 200
    ): void {
        response.status(statusCode).json({ data })
    }
}
