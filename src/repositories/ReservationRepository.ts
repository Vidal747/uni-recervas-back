import { randomUUID } from 'node:crypto'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { DatabaseConnection } from '../config/database.js'
import type { ReservationStatus } from '../models/Reservation.js'
import { Reservation } from '../models/Reservation.js'
import { Space } from '../models/Space.js'
import type { TimeInterval } from '../utils/time.js'

type ReservationRow = RowDataPacket & {
    id: string
    student_id: string
    space_id: string
    approved_by_administrator_id: string | null
    date: string
    start_time: string
    end_time: string
    purpose: string
    status: ReservationStatus
    observations: string | null
    created_at: string
    updated_at: string | null
}

type ReservationListRow = RowDataPacket & {
    id: string
    student_id: string
    space_id: string
    date: string
    start_time: string
    end_time: string
    purpose: string
    status: ReservationStatus
    observations: string | null
    created_at: string
    updated_at: string | null
    space_name: string
    space_type: string
    space_location: string
}

type ReservationDetailRow = RowDataPacket & {
    id: string
    student_id: string
    space_id: string
    approved_by_administrator_id: string | null
    date: string
    start_time: string
    end_time: string
    purpose: string
    status: ReservationStatus
    observations: string | null
    created_at: string
    updated_at: string | null
    space_name: string
    space_type: string
    space_location: string
    space_capacity: number
    space_status: string
    space_description: string | null
    resource_link_id: string | null
    resource_id: string | null
    resource_name: string | null
    resource_description: string | null
    resource_status: string | null
    quantity: number | null
}

type UserRoleRow = RowDataPacket & {
    user_id: string
}

export type ReservationCreationInput = {
    readonly studentId: string
    readonly spaceId: string
    readonly date: string
    readonly startTime: string
    readonly endTime: string
    readonly purpose: string
}

export type ReservationReviewInput = {
    readonly reservationId: string
    readonly administratorId: string
    readonly action: 'approve' | 'reject'
    readonly observations?: string
}

export type ReservationListItem = {
    readonly reservation: Reservation
    readonly space: {
        readonly id: string
        readonly name: string
        readonly type: string
        readonly location: string
    }
}

export type ReservationDetail = {
    readonly reservation: Reservation
    readonly space: Space
}

export class ReservationRepository {
    private readonly pool = DatabaseConnection.getInstance()

    public async create(input: ReservationCreationInput): Promise<Reservation> {
        const reservationId = randomUUID()
        await this.pool.execute<ResultSetHeader>(
            `
      INSERT INTO reservations (
        id,
        student_id,
        space_id,
        date,
        start_time,
        end_time,
        purpose,
        status,
        observations,
        approved_by_administrator_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL, NULL)
    `,
            [
                reservationId,
                input.studentId,
                input.spaceId,
                input.date,
                input.startTime,
                input.endTime,
                input.purpose
            ]
        )

        const reservation = await this.findById(reservationId)

        if (reservation === null) {
            throw new Error('Reservation insert failed')
        }

        return reservation
    }

    public async findById(reservationId: string): Promise<Reservation | null> {
        const [rows] = await this.pool.query<ReservationRow[]>(
            `
      SELECT
        id,
        student_id,
        space_id,
        approved_by_administrator_id,
        date,
        start_time,
        end_time,
        purpose,
        status,
        observations,
        created_at,
        updated_at
      FROM reservations
      WHERE id = ?
    `,
            [reservationId]
        )

        if (rows.length === 0) {
            return null
        }

        return Reservation.fromRow(rows[0])
    }

    public async findDetailById(
        reservationId: string
    ): Promise<ReservationDetail | null> {
        const [rows] = await this.pool.query<ReservationDetailRow[]>(
            `
      SELECT
        r.id,
        r.student_id,
        r.space_id,
        r.approved_by_administrator_id,
        r.date,
        r.start_time,
        r.end_time,
        r.purpose,
        r.status,
        r.observations,
        r.created_at,
        r.updated_at,
        s.name AS space_name,
        s.type AS space_type,
        s.location AS space_location,
        s.capacity AS space_capacity,
        s.status AS space_status,
        s.description AS space_description,
        sr.id AS resource_link_id,
        res.id AS resource_id,
        res.name AS resource_name,
        res.description AS resource_description,
        res.status AS resource_status,
        sr.quantity
      FROM reservations r
      INNER JOIN spaces s ON s.id = r.space_id
      LEFT JOIN space_resources sr ON sr.space_id = s.id
      LEFT JOIN resources res ON res.id = sr.resource_id
      WHERE r.id = ?
      ORDER BY res.name
    `,
            [reservationId]
        )

        if (rows.length === 0) {
            return null
        }

        const reservation = Reservation.fromRow(rows[0])
        const resourceRows = rows
            .filter((row) => row.resource_id !== null)
            .map((row) => ({
                id: row.resource_link_id ?? row.resource_id ?? '',
                resourceId: row.resource_id ?? '',
                name: row.resource_name ?? '',
                description: row.resource_description ?? null,
                status: row.resource_status ?? 'AVAILABLE',
                quantity: row.quantity ?? 0
            }))

        const space = Space.fromRow({
            id: rows[0].space_id,
            name: rows[0].space_name,
            type: rows[0].space_type,
            location: rows[0].space_location,
            capacity: rows[0].space_capacity,
            status: rows[0].space_status,
            description: rows[0].space_description,
            resources: resourceRows
        })

        return { reservation, space }
    }

    public async listByStudent(
        studentId: string
    ): Promise<ReservationListItem[]> {
        const [rows] = await this.pool.query<ReservationListRow[]>(
            `
      SELECT
        r.id,
        r.student_id,
        r.space_id,
        r.date,
        r.start_time,
        r.end_time,
        r.purpose,
        r.status,
        r.observations,
        r.created_at,
        r.updated_at,
        s.name AS space_name,
        s.type AS space_type,
        s.location AS space_location
      FROM reservations r
      INNER JOIN spaces s ON s.id = r.space_id
      WHERE r.student_id = ?
      ORDER BY r.date DESC, r.start_time DESC, r.created_at DESC
    `,
            [studentId]
        )

        return rows.map((row) => ({
            reservation: Reservation.fromRow(row),
            space: {
                id: row.space_id,
                name: row.space_name,
                type: row.space_type,
                location: row.space_location
            }
        }))
    }

    public async listPending(): Promise<ReservationListItem[]> {
        const [rows] = await this.pool.query<ReservationListRow[]>(
            `
      SELECT
        r.id,
        r.student_id,
        r.space_id,
        r.date,
        r.start_time,
        r.end_time,
        r.purpose,
        r.status,
        r.observations,
        r.created_at,
        r.updated_at,
        s.name AS space_name,
        s.type AS space_type,
        s.location AS space_location
      FROM reservations r
      INNER JOIN spaces s ON s.id = r.space_id
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at ASC, r.date ASC, r.start_time ASC
    `
        )

        return rows.map((row) => ({
            reservation: Reservation.fromRow(row),
            space: {
                id: row.space_id,
                name: row.space_name,
                type: row.space_type,
                location: row.space_location
            }
        }))
    }

    public async findStudentByUserId(
        userId: string
    ): Promise<UserRoleRow | null> {
        const [rows] = await this.pool.query<UserRoleRow[]>(
            `
      SELECT user_id
      FROM students
      WHERE user_id = ?
    `,
            [userId]
        )

        return rows[0] ?? null
    }

    public async findAdministratorByUserId(
        userId: string
    ): Promise<UserRoleRow | null> {
        const [rows] = await this.pool.query<UserRoleRow[]>(
            `
      SELECT user_id
      FROM administrators
      WHERE user_id = ?
    `,
            [userId]
        )

        return rows[0] ?? null
    }

    public async findReservationsBySpaceAndDate(
        spaceId: string,
        date: string
    ): Promise<TimeInterval[]> {
        const [rows] = await this.pool.query<
            Array<{ start_time: string; end_time: string } & RowDataPacket>
        >(
            `
      SELECT start_time, end_time
      FROM reservations
      WHERE space_id = ?
        AND date = ?
        AND status IN ('PENDING', 'APPROVED')
      ORDER BY start_time
    `,
            [spaceId, date]
        )

        return rows.map((row) => ({ start: row.start_time, end: row.end_time }))
    }

    public async findByStudentAndStatus(
        studentId: string,
        reservationId: string
    ): Promise<Reservation | null> {
        const [rows] = await this.pool.query<ReservationRow[]>(
            `
      SELECT
        id,
        student_id,
        space_id,
        approved_by_administrator_id,
        date,
        start_time,
        end_time,
        purpose,
        status,
        observations,
        created_at,
        updated_at
      FROM reservations
      WHERE id = ? AND student_id = ?
    `,
            [reservationId, studentId]
        )

        if (rows.length === 0) {
            return null
        }

        return Reservation.fromRow(rows[0])
    }

    public async cancelReservation(
        reservationId: string
    ): Promise<Reservation | null> {
        await this.pool.execute(
            `
      UPDATE reservations
      SET status = 'CANCELLED'
      WHERE id = ?
    `,
            [reservationId]
        )

        return this.findById(reservationId)
    }

    public async reviewReservation(
        input: ReservationReviewInput
    ): Promise<Reservation | null> {
        const nextStatus = input.action === 'approve' ? 'APPROVED' : 'REJECTED'
        await this.pool.execute(
            `
      UPDATE reservations
      SET status = ?,
          approved_by_administrator_id = ?,
          observations = ?
      WHERE id = ?
    `,
            [
                nextStatus,
                input.administratorId,
                input.observations ?? null,
                input.reservationId
            ]
        )

        return this.findById(input.reservationId)
    }

    public async findConflicts(
        spaceId: string,
        date: string
    ): Promise<TimeInterval[]> {
        return this.findReservationsBySpaceAndDate(spaceId, date)
    }

    public async hasReservationWithStatus(
        reservationId: string,
        statuses: ReservationStatus[]
    ): Promise<boolean> {
        if (statuses.length === 0) {
            return false
        }

        const placeholders = statuses.map(() => '?').join(', ')
        const [rows] = await this.pool.query<
            Array<{ id: string } & RowDataPacket>
        >(
            `
      SELECT id
      FROM reservations
      WHERE id = ? AND status IN (${placeholders})
    `,
            [reservationId, ...statuses]
        )

        return rows.length > 0
    }
}
