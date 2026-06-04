import { AppError } from '../errors/AppError.js'
import type { EventBus } from '../events/EventBus.js'
import type {
    ReservationDetail,
    ReservationListItem,
    ReservationRepository
} from '../repositories/ReservationRepository.js'
import type { SpaceRepository } from '../repositories/SpaceRepository.js'
import type {
    ReservationValidationContext,
    ReservationValidationStrategy
} from '../strategies/ReservationValidationStrategy.js'
import type { Reservation } from './Reservation.js'

export type CreateReservationInput = {
    readonly spaceId: string
    readonly date: string
    readonly startTime: string
    readonly endTime: string
    readonly purpose: string
}

export type ReviewReservationInput = {
    readonly action: 'approve' | 'reject'
    readonly observations?: string
}

export class ReservationModel {
    private readonly validationStrategies: ReservationValidationStrategy[]

    public constructor(
        private readonly reservationRepository: ReservationRepository,
        private readonly spaceRepository: SpaceRepository,
        private readonly eventBus: EventBus,
        validationStrategies: ReservationValidationStrategy[]
    ) {
        this.validationStrategies = validationStrategies
    }

    public async createReservation(
        userId: string,
        input: CreateReservationInput
    ): Promise<Reservation> {
        const student =
            await this.reservationRepository.findStudentByUserId(userId)

        if (student === null) {
            throw new AppError(403, 'Only students can create reservations')
        }

        const space = await this.spaceRepository.findByIdWithResources(
            input.spaceId
        )

        if (space === null || space.status !== 'AVAILABLE') {
            throw new AppError(404, 'Space not available')
        }

        const validationContext = await this.buildValidationContext(
            input.spaceId,
            input.date,
            input.startTime,
            input.endTime
        )

        for (const strategy of this.validationStrategies) {
            await strategy.validate(validationContext)
        }

        const reservation = await this.reservationRepository.create({
            studentId: student.user_id,
            spaceId: input.spaceId,
            date: input.date,
            startTime: input.startTime,
            endTime: input.endTime,
            purpose: input.purpose
        })

        this.eventBus.notify('reservation.created', { reservation })

        return reservation
    }

    public async listMyReservations(
        userId: string
    ): Promise<ReservationListItem[]> {
        const student =
            await this.reservationRepository.findStudentByUserId(userId)

        if (student === null) {
            throw new AppError(403, 'Only students can list reservations')
        }

        return this.reservationRepository.listByStudent(student.user_id)
    }

    public async cancelReservation(
        userId: string,
        reservationId: string
    ): Promise<Reservation> {
        const student =
            await this.reservationRepository.findStudentByUserId(userId)

        if (student === null) {
            throw new AppError(403, 'Only students can cancel reservations')
        }

        const reservation =
            await this.reservationRepository.findByStudentAndStatus(
                student.user_id,
                reservationId
            )

        if (reservation === null) {
            throw new AppError(404, 'Reservation not found')
        }

        if (
            reservation.status !== 'PENDING' &&
            reservation.status !== 'APPROVED'
        ) {
            throw new AppError(
                409,
                'Only pending or approved reservations can be cancelled'
            )
        }

        const cancelledReservation =
            await this.reservationRepository.cancelReservation(reservationId)

        if (cancelledReservation === null) {
            throw new AppError(404, 'Reservation not found')
        }

        this.eventBus.notify('reservation.cancelled', {
            reservation: cancelledReservation
        })

        return cancelledReservation
    }

    public async reviewReservation(
        userId: string,
        reservationId: string,
        input: ReviewReservationInput
    ): Promise<Reservation> {
        const administrator =
            await this.reservationRepository.findAdministratorByUserId(userId)

        if (administrator === null) {
            throw new AppError(
                403,
                'Only administrators can review reservations'
            )
        }

        const reservation =
            await this.reservationRepository.findById(reservationId)

        if (reservation === null) {
            throw new AppError(404, 'Reservation not found')
        }

        if (reservation.status !== 'PENDING') {
            throw new AppError(409, 'Only pending reservations can be reviewed')
        }

        const reviewedReservation =
            await this.reservationRepository.reviewReservation({
                reservationId,
                administratorId: administrator.user_id,
                action: input.action,
                observations: input.observations
            })

        if (reviewedReservation === null) {
            throw new AppError(404, 'Reservation not found')
        }

        this.eventBus.notify(
            input.action === 'approve'
                ? 'reservation.approved'
                : 'reservation.rejected',
            { reservation: reviewedReservation }
        )

        return reviewedReservation
    }

    public async listPendingReservations(
        userId: string
    ): Promise<ReservationListItem[]> {
        const administrator =
            await this.reservationRepository.findAdministratorByUserId(userId)

        if (administrator === null) {
            throw new AppError(
                403,
                'Only administrators can list pending reservations'
            )
        }

        return this.reservationRepository.listPending()
    }

    public async getReservationDetail(
        userId: string,
        reservationId: string
    ): Promise<ReservationDetail> {
        const reservationDetail =
            await this.reservationRepository.findDetailById(reservationId)

        if (reservationDetail === null) {
            throw new AppError(404, 'Reservation not found')
        }

        const isOwner = reservationDetail.reservation.studentId === userId
        const isAdministrator =
            await this.reservationRepository.findAdministratorByUserId(userId)

        if (!isOwner && isAdministrator === null) {
            throw new AppError(403, 'Access denied')
        }

        return reservationDetail
    }

    private async buildValidationContext(
        spaceId: string,
        date: string,
        startTime: string,
        endTime: string
    ): Promise<ReservationValidationContext> {
        const blockedPeriods =
            await this.spaceRepository.findBlockedPeriodsBySpaceAndDate(
                spaceId,
                date
            )
        const existingReservations =
            await this.reservationRepository.findConflicts(spaceId, date)

        return {
            startTime,
            endTime,
            blockedPeriods,
            existingReservations
        }
    }
}
