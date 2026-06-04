import type {
    AvailabilityData,
    AvailabilityModel
} from '../models/AvailabilityModel.js'
import type { Reservation } from '../models/Reservation.js'
import type {
    CreateReservationInput,
    ReservationModel,
    ReviewReservationInput
} from '../models/ReservationModel.js'
import type { Space } from '../models/Space.js'
import type { SpaceModel } from '../models/SpaceModel.js'
import type { NotificationObserver } from '../observers/NotificationObserver.js'
import type {
    ReservationDetail,
    ReservationListItem
} from '../repositories/ReservationRepository.js'

export class ReservationFacade {
    public constructor(
        private readonly reservationModel: ReservationModel,
        private readonly spaceModel: SpaceModel,
        private readonly availabilityModel: AvailabilityModel,
        private readonly notificationObserver: NotificationObserver
    ) {}

    public async listSpaces(): Promise<Space[]> {
        return this.spaceModel.listAvailable()
    }

    public async checkAvailability(
        spaceId: string,
        date: string
    ): Promise<AvailabilityData> {
        return this.availabilityModel.checkAvailability(spaceId, date)
    }

    public async createReservation(
        userId: string,
        input: CreateReservationInput
    ): Promise<Reservation> {
        const reservation = await this.reservationModel.createReservation(
            userId,
            input
        )
        await this.notificationObserver.flush()
        return reservation
    }

    public async listMyReservations(
        userId: string
    ): Promise<ReservationListItem[]> {
        return this.reservationModel.listMyReservations(userId)
    }

    public async cancelReservation(
        userId: string,
        reservationId: string
    ): Promise<Reservation> {
        const reservation = await this.reservationModel.cancelReservation(
            userId,
            reservationId
        )
        await this.notificationObserver.flush()
        return reservation
    }

    public async reviewReservation(
        userId: string,
        reservationId: string,
        input: ReviewReservationInput
    ): Promise<Reservation> {
        const reservation = await this.reservationModel.reviewReservation(
            userId,
            reservationId,
            input
        )
        await this.notificationObserver.flush()
        return reservation
    }

    public async listPendingReservations(
        userId: string
    ): Promise<ReservationListItem[]> {
        return this.reservationModel.listPendingReservations(userId)
    }

    public async getReservationDetail(
        userId: string,
        reservationId: string
    ): Promise<ReservationDetail> {
        return this.reservationModel.getReservationDetail(userId, reservationId)
    }
}
