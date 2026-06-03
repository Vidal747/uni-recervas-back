import type { RowDataPacket } from 'mysql2/promise'
import { DatabaseConnection } from '../config/database.js'

type UserPhoneRow = RowDataPacket & {
    phone: string | null
}

export class UserRepository {
    private readonly pool = DatabaseConnection.getInstance()

    public async findPhoneByUserId(userId: string): Promise<string | null> {
        const [rows] = await this.pool.query<UserPhoneRow[]>(
            `
      SELECT phone
      FROM users
      WHERE id = ?
        AND status = 'ACTIVE'
    `,
            [userId]
        )

        const phone = rows[0]?.phone

        if (phone === null || phone === undefined) {
            return null
        }

        const normalizedPhone = phone.trim()

        return normalizedPhone.length > 0 ? normalizedPhone : null
    }
}
