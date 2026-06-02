import type { TimeInterval } from '../utils/time.js'

export type ReservationValidationContext = {
    readonly startTime: string
    readonly endTime: string
    readonly existingReservations: TimeInterval[]
    readonly blockedPeriods: TimeInterval[]
}

export interface ReservationValidationStrategy {
    validate(context: ReservationValidationContext): Promise<void>
}
