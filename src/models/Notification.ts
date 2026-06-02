export type NotificationType =
    | 'APPROVAL'
    | 'REJECTION'
    | 'REMINDER'
    | 'CANCELLATION'
    | 'RESCHEDULE'

export type NotificationStatus = 'PENDING' | 'SENT' | 'READ'

export class Notification {
    private readonly _id: string
    private readonly _studentId: string
    private readonly _reservationId: string | null
    private readonly _title: string
    private readonly _message: string
    private readonly _type: NotificationType
    private readonly _status: NotificationStatus
    private readonly _sentAt: string | null
    private readonly _readAt: string | null
    private readonly _createdAt: string

    public constructor(
        id: string,
        studentId: string,
        reservationId: string | null,
        title: string,
        message: string,
        type: NotificationType,
        status: NotificationStatus,
        sentAt: string | null,
        readAt: string | null,
        createdAt: string
    ) {
        this._id = id
        this._studentId = studentId
        this._reservationId = reservationId
        this._title = title
        this._message = message
        this._type = type
        this._status = status
        this._sentAt = sentAt
        this._readAt = readAt
        this._createdAt = createdAt
    }

    public get id(): string {
        return this._id
    }

    public get studentId(): string {
        return this._studentId
    }

    public get reservationId(): string | null {
        return this._reservationId
    }

    public get title(): string {
        return this._title
    }

    public get message(): string {
        return this._message
    }

    public get type(): NotificationType {
        return this._type
    }

    public get status(): NotificationStatus {
        return this._status
    }

    public get sentAt(): string | null {
        return this._sentAt
    }

    public get readAt(): string | null {
        return this._readAt
    }

    public get createdAt(): string {
        return this._createdAt
    }

    public static fromRow(row: Record<string, unknown>): Notification {
        return new Notification(
            String(row.id),
            String(row.student_id),
            row.reservation_id === null || row.reservation_id === undefined
                ? null
                : String(row.reservation_id),
            String(row.title),
            String(row.message),
            String(row.type) as NotificationType,
            String(row.status) as NotificationStatus,
            row.sent_at === null || row.sent_at === undefined
                ? null
                : String(row.sent_at),
            row.read_at === null || row.read_at === undefined
                ? null
                : String(row.read_at),
            String(row.created_at)
        )
    }
}
