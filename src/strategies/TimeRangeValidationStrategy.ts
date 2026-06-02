import { AppError } from '../errors/AppError.js'
import { timeToSeconds } from '../utils/time.js'
import type {
    ReservationValidationContext,
    ReservationValidationStrategy
} from './ReservationValidationStrategy.js'

export class TimeRangeValidationStrategy
    implements ReservationValidationStrategy
{
    public async validate(
        context: ReservationValidationContext
    ): Promise<void> {
        if (
            timeToSeconds(context.startTime) >= timeToSeconds(context.endTime)
        ) {
            throw new AppError(400, 'startTime must be before endTime')
        }
    }
}
