import { AppError } from '../errors/AppError.js'
import type { ReservationRepository } from '../repositories/ReservationRepository.js'
import type { SpaceRepository } from '../repositories/SpaceRepository.js'
import type { TimeInterval } from '../utils/time.js'
import { complementIntervals } from '../utils/time.js'

export type AvailabilityData = {
    readonly spaceId: string
    readonly date: string
    readonly freeSlots: TimeInterval[]
    readonly blockedPeriods: TimeInterval[]
    readonly reservationConflicts: TimeInterval[]
}

export class AvailabilityModel {
    public constructor(
        private readonly spaceRepository: SpaceRepository,
        private readonly reservationRepository: ReservationRepository
    ) {}

    public async checkAvailability(
        spaceId: string,
        date: string
    ): Promise<AvailabilityData> {
        const space = await this.spaceRepository.findByIdWithResources(spaceId)

        if (space === null) {
            throw new AppError(404, 'Space not found')
        }

        const blockedPeriods =
            await this.spaceRepository.findBlockedPeriodsBySpaceAndDate(
                spaceId,
                date
            )
        const reservationConflicts =
            await this.reservationRepository.findConflicts(spaceId, date)
        const freeSlots = complementIntervals([
            ...blockedPeriods,
            ...reservationConflicts
        ])

        return {
            spaceId,
            date,
            freeSlots,
            blockedPeriods,
            reservationConflicts
        }
    }
}
