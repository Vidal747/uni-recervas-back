import { AppError } from '../errors/AppError.js'
import { intervalsOverlap } from '../utils/time.js'
import type {
    ReservationValidationContext,
    ReservationValidationStrategy
} from './ReservationValidationStrategy.js'

export class OverlapValidationStrategy
    implements ReservationValidationStrategy
{
    public async validate(
        context: ReservationValidationContext
    ): Promise<void> {
        const candidate = { start: context.startTime, end: context.endTime }

        for (const reservation of context.existingReservations) {
            if (intervalsOverlap(candidate, reservation)) {
                throw new AppError(
                    409,
                    'The space already has a reservation that overlaps with the requested time'
                )
            }
        }
    }
}
