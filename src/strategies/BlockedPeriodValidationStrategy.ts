import { AppError } from '../errors/AppError.js'
import { intervalsOverlap } from '../utils/time.js'
import type {
    ReservationValidationContext,
    ReservationValidationStrategy
} from './ReservationValidationStrategy.js'

export class BlockedPeriodValidationStrategy
    implements ReservationValidationStrategy
{
    public async validate(
        context: ReservationValidationContext
    ): Promise<void> {
        const candidate = { start: context.startTime, end: context.endTime }

        for (const blockedPeriod of context.blockedPeriods) {
            if (intervalsOverlap(candidate, blockedPeriod)) {
                throw new AppError(
                    409,
                    'The space is blocked during the requested time'
                )
            }
        }
    }
}
