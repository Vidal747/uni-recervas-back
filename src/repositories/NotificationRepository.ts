import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { DatabaseConnection } from '../config/database.js'
import type {
    NotificationStatus,
    NotificationType
} from '../models/Notification.js'
import { Notification } from '../models/Notification.js'

type NotificationRow = RowDataPacket & {
    id: string
    student_id: string
    reservation_id: string | null
    title: string
    message: string
    type: NotificationType
    status: NotificationStatus
    sent_at: string | null
    read_at: string | null
    created_at: string
}

export type CreateNotificationInput = {
    readonly studentId: string
    readonly reservationId: string
    readonly title: string
    readonly message: string
    readonly type: NotificationType
    readonly status?: NotificationStatus
}

export class NotificationRepository {
    private readonly pool = DatabaseConnection.getInstance()

    public async create(input: CreateNotificationInput): Promise<Notification> {
        await this.pool.execute<ResultSetHeader>(
            `
      INSERT INTO notifications (
        student_id,
        reservation_id,
        title,
        message,
        type,
        status,
        sent_at,
        read_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL)
    `,
            [
                input.studentId,
                input.reservationId,
                input.title,
                input.message,
                input.type,
                input.status ?? 'SENT'
            ]
        )

        const [rows] = await this.pool.query<NotificationRow[]>(
            `
      SELECT
        id,
        student_id,
        reservation_id,
        title,
        message,
        type,
        status,
        sent_at,
        read_at,
        created_at
      FROM notifications
      WHERE student_id = ? AND reservation_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
            [input.studentId, input.reservationId]
        )

        if (rows.length === 0) {
            throw new Error('Notification insert failed')
        }

        return Notification.fromRow(rows[0])
    }
}
