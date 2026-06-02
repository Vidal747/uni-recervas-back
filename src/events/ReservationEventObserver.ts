import type { Reservation } from '../models/Reservation.js'

export type ReservationEventName =
    | 'reservation.created'
    | 'reservation.approved'
    | 'reservation.rejected'
    | 'reservation.cancelled'

export type ReservationEventPayload = {
    readonly reservation: Reservation
}

export interface ReservationEventObserver {
    supports(event: ReservationEventName): boolean
    handle(
        event: ReservationEventName,
        payload: ReservationEventPayload
    ): Promise<void>
}
