export type ReservationStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'COMPLETED'
    | 'RESCHEDULED'

export class Reservation {
    private readonly _id: string
    private readonly _studentId: string
    private readonly _spaceId: string
    private readonly _approvedByAdministratorId: string | null
    private readonly _date: string
    private readonly _startTime: string
    private readonly _endTime: string
    private readonly _purpose: string
    private readonly _status: ReservationStatus
    private readonly _observations: string | null
    private readonly _createdAt: string
    private readonly _updatedAt: string | null

    public constructor(
        id: string,
        studentId: string,
        spaceId: string,
        approvedByAdministratorId: string | null,
        date: string,
        startTime: string,
        endTime: string,
        purpose: string,
        status: ReservationStatus,
        observations: string | null,
        createdAt: string,
        updatedAt: string | null
    ) {
        this._id = id
        this._studentId = studentId
        this._spaceId = spaceId
        this._approvedByAdministratorId = approvedByAdministratorId
        this._date = date
        this._startTime = startTime
        this._endTime = endTime
        this._purpose = purpose
        this._status = status
        this._observations = observations
        this._createdAt = createdAt
        this._updatedAt = updatedAt
    }

    public get id(): string {
        return this._id
    }

    public get studentId(): string {
        return this._studentId
    }

    public get spaceId(): string {
        return this._spaceId
    }

    public get approvedByAdministratorId(): string | null {
        return this._approvedByAdministratorId
    }

    public get date(): string {
        return this._date
    }

    public get startTime(): string {
        return this._startTime
    }

    public get endTime(): string {
        return this._endTime
    }

    public get purpose(): string {
        return this._purpose
    }

    public get status(): ReservationStatus {
        return this._status
    }

    public get observations(): string | null {
        return this._observations
    }

    public get createdAt(): string {
        return this._createdAt
    }

    public get updatedAt(): string | null {
        return this._updatedAt
    }

    public static fromRow(row: Record<string, unknown>): Reservation {
        return new Reservation(
            String(row.id),
            String(row.student_id),
            String(row.space_id),
            row.approved_by_administrator_id === null ||
                row.approved_by_administrator_id === undefined
                ? null
                : String(row.approved_by_administrator_id),
            String(row.date),
            String(row.start_time),
            String(row.end_time),
            String(row.purpose),
            String(row.status) as ReservationStatus,
            row.observations === null || row.observations === undefined
                ? null
                : String(row.observations),
            String(row.created_at),
            row.updated_at === null || row.updated_at === undefined
                ? null
                : String(row.updated_at)
        )
    }
}
