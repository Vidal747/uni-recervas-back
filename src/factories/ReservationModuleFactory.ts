import { ReservationController } from '../controllers/ReservationController.js'
import { EventBus } from '../events/EventBus.js'
import { ReservationFacade } from '../facade/ReservationFacade.js'
import { AvailabilityModel } from '../models/AvailabilityModel.js'
import { ReservationModel } from '../models/ReservationModel.js'
import { SpaceModel } from '../models/SpaceModel.js'
import { NotificationObserver } from '../observers/NotificationObserver.js'
import { NotificationRepository } from '../repositories/NotificationRepository.js'
import { ReservationRepository } from '../repositories/ReservationRepository.js'
import { SpaceRepository } from '../repositories/SpaceRepository.js'
import { BlockedPeriodValidationStrategy } from '../strategies/BlockedPeriodValidationStrategy.js'
import { OverlapValidationStrategy } from '../strategies/OverlapValidationStrategy.js'
import { TimeRangeValidationStrategy } from '../strategies/TimeRangeValidationStrategy.js'

export class ReservationModuleFactory {
    public static createController(): ReservationController {
        const eventBus = EventBus.getInstance()
        const spaceRepository = new SpaceRepository()
        const reservationRepository = new ReservationRepository()
        const notificationRepository = new NotificationRepository()

        const notificationObserver = new NotificationObserver(
            notificationRepository
        )
        eventBus.attach(notificationObserver)

        const validationStrategies = [
            new TimeRangeValidationStrategy(),
            new OverlapValidationStrategy(),
            new BlockedPeriodValidationStrategy()
        ]

        const spaceModel = new SpaceModel(spaceRepository)
        const availabilityModel = new AvailabilityModel(
            spaceRepository,
            reservationRepository
        )
        const reservationModel = new ReservationModel(
            reservationRepository,
            spaceRepository,
            eventBus,
            validationStrategies
        )

        const facade = new ReservationFacade(
            reservationModel,
            spaceModel,
            availabilityModel,
            notificationObserver
        )

        return new ReservationController(facade)
    }
}
