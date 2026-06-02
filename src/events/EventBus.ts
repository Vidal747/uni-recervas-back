import type {
    ReservationEventName,
    ReservationEventObserver,
    ReservationEventPayload
} from './ReservationEventObserver.js'

export class EventBus {
    private static instance: EventBus | null = null
    private readonly observers: ReservationEventObserver[] = []

    private constructor() {}

    public static getInstance(): EventBus {
        if (EventBus.instance === null) {
            EventBus.instance = new EventBus()
        }

        return EventBus.instance
    }

    public attach(observer: ReservationEventObserver): void {
        this.observers.push(observer)
    }

    public notify(
        event: ReservationEventName,
        payload: ReservationEventPayload
    ): void {
        for (const observer of this.observers) {
            if (observer.supports(event)) {
                void observer.handle(event, payload)
            }
        }
    }
}
