import type {
    ReservationEventName,
    ReservationEventObserver,
    ReservationEventPayload
} from '../events/ReservationEventObserver.js'
import type { NotificationRepository } from '../repositories/NotificationRepository.js'

const SUPPORTED_EVENTS: ReservationEventName[] = [
    'reservation.created',
    'reservation.approved',
    'reservation.rejected',
    'reservation.cancelled'
]

export class NotificationObserver implements ReservationEventObserver {
    private readonly pendingJobs: Promise<void>[] = []

    public constructor(
        private readonly notificationRepository: NotificationRepository
    ) {}

    public supports(event: ReservationEventName): boolean {
        return SUPPORTED_EVENTS.includes(event)
    }

    public async handle(
        event: ReservationEventName,
        payload: ReservationEventPayload
    ): Promise<void> {
        switch (event) {
            case 'reservation.created':
                this.pendingJobs.push(this.handleReservationCreated(payload))
                break
            case 'reservation.approved':
                this.pendingJobs.push(this.handleReservationApproved(payload))
                break
            case 'reservation.rejected':
                this.pendingJobs.push(this.handleReservationRejected(payload))
                break
            case 'reservation.cancelled':
                this.pendingJobs.push(this.handleReservationCancelled(payload))
                break
        }
    }

    public async flush(): Promise<void> {
        await Promise.all(this.pendingJobs)
        this.pendingJobs.length = 0
    }

    private async handleReservationCreated(
        payload: ReservationEventPayload
    ): Promise<void> {
        await this.notificationRepository.create({
            studentId: payload.reservation.studentId,
            reservationId: payload.reservation.id,
            title: 'Reservation created',
            message:
                'Your reservation request was created and is pending review.',
            type: 'REMINDER'
        })
    }

    private async handleReservationApproved(
        payload: ReservationEventPayload
    ): Promise<void> {
        await this.notificationRepository.create({
            studentId: payload.reservation.studentId,
            reservationId: payload.reservation.id,
            title: 'Reservation approved',
            message: 'Your reservation has been approved.',
            type: 'APPROVAL'
        })
    }

    private async handleReservationRejected(
        payload: ReservationEventPayload
    ): Promise<void> {
        await this.notificationRepository.create({
            studentId: payload.reservation.studentId,
            reservationId: payload.reservation.id,
            title: 'Reservation rejected',
            message: 'Your reservation has been rejected.',
            type: 'REJECTION'
        })
    }

    private async handleReservationCancelled(
        payload: ReservationEventPayload
    ): Promise<void> {
        await this.notificationRepository.create({
            studentId: payload.reservation.studentId,
            reservationId: payload.reservation.id,
            title: 'Reservation cancelled',
            message: 'Your reservation has been cancelled.',
            type: 'CANCELLATION'
        })
    }
}
