import type { RowDataPacket } from 'mysql2/promise'
import { DatabaseConnection } from '../config/database.js'
import { Space } from '../models/Space.js'
import type { TimeInterval } from '../utils/time.js'

type SpaceRow = RowDataPacket & {
    id: string
    name: string
    type: string
    location: string
    capacity: number
    status: string
    description: string | null
    resource_link_id?: string
    resource_id?: string
    resource_name?: string
    resource_description?: string | null
    resource_status?: string
    quantity?: number
}

type BlockedPeriodRow = RowDataPacket & {
    start_time: string
    end_time: string
}

export class SpaceRepository {
    private readonly pool = DatabaseConnection.getInstance()

    public async listAvailableSpacesWithResources(): Promise<Space[]> {
        const [rows] = await this.pool.query<SpaceRow[]>(`
      SELECT
        s.id,
        s.name,
        s.type,
        s.location,
        s.capacity,
        s.status,
        s.description,
        sr.id AS resource_link_id,
        r.id AS resource_id,
        r.name AS resource_name,
        r.description AS resource_description,
        r.status AS resource_status,
        sr.quantity
      FROM spaces s
      LEFT JOIN space_resources sr ON sr.space_id = s.id
      LEFT JOIN resources r ON r.id = sr.resource_id
      WHERE s.status = 'AVAILABLE'
      ORDER BY s.name, r.name
    `)

        return this.groupSpaces(rows)
    }

    public async findByIdWithResources(spaceId: string): Promise<Space | null> {
        const [rows] = await this.pool.query<SpaceRow[]>(
            `
      SELECT
        s.id,
        s.name,
        s.type,
        s.location,
        s.capacity,
        s.status,
        s.description,
        sr.id AS resource_link_id,
        r.id AS resource_id,
        r.name AS resource_name,
        r.description AS resource_description,
        r.status AS resource_status,
        sr.quantity
      FROM spaces s
      LEFT JOIN space_resources sr ON sr.space_id = s.id
      LEFT JOIN resources r ON r.id = sr.resource_id
      WHERE s.id = ?
      ORDER BY r.name
    `,
            [spaceId]
        )

        if (rows.length === 0) {
            return null
        }

        return this.groupSpaces(rows)[0] ?? null
    }

    public async findBlockedPeriodsBySpaceAndDate(
        spaceId: string,
        date: string
    ): Promise<TimeInterval[]> {
        const [rows] = await this.pool.query<BlockedPeriodRow[]>(
            `
      SELECT start_time, end_time
      FROM blocked_periods
      WHERE space_id = ? AND date = ?
      ORDER BY start_time
    `,
            [spaceId, date]
        )

        return rows.map((row) => ({ start: row.start_time, end: row.end_time }))
    }

    private groupSpaces(rows: SpaceRow[]): Space[] {
        const grouped = new Map<
            string,
            Record<string, unknown> & {
                resources: Array<Record<string, unknown>>
            }
        >()

        for (const row of rows) {
            const existing = grouped.get(row.id)

            if (!existing) {
                grouped.set(row.id, {
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    location: row.location,
                    capacity: row.capacity,
                    status: row.status,
                    description: row.description,
                    resources: []
                })
            }

            if (row.resource_id) {
                grouped.get(row.id)?.resources.push({
                    id: row.resource_link_id ?? row.resource_id,
                    resourceId: row.resource_id,
                    name: row.resource_name ?? '',
                    description: row.resource_description ?? null,
                    status: row.resource_status ?? 'AVAILABLE',
                    quantity: row.quantity ?? 0
                })
            }
        }

        return [...grouped.values()].map((group) => Space.fromRow(group))
    }
}
