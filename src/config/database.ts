import type { Pool } from 'mysql2/promise'
import mysql from 'mysql2/promise'

export class DatabaseConnection {
    private static instance: Pool | null = null

    public static getInstance(): Pool {
        if (DatabaseConnection.instance === null) {
            DatabaseConnection.instance = mysql.createPool({
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: '12345',
                database: 'poli_space_reservation',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                dateStrings: true
            })
        }

        return DatabaseConnection.instance
    }
}
