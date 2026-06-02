export type SpaceStatus =
    | 'AVAILABLE'
    | 'DISABLED'
    | 'UNDER_MAINTENANCE'
    | 'RESTRICTED'

export type SpaceType =
    | 'CLASSROOM'
    | 'LABORATORY'
    | 'COURT'
    | 'AUDITORIUM'
    | 'OTHER'

export type SpaceResource = {
    readonly id: string
    readonly resourceId: string
    readonly name: string
    readonly description: string | null
    readonly status: string
    readonly quantity: number
}

export class Space {
    private readonly _id: string
    private readonly _name: string
    private readonly _type: SpaceType
    private readonly _location: string
    private readonly _capacity: number
    private readonly _status: SpaceStatus
    private readonly _description: string | null
    private readonly _resources: ReadonlyArray<SpaceResource>

    public constructor(
        id: string,
        name: string,
        type: SpaceType,
        location: string,
        capacity: number,
        status: SpaceStatus,
        description: string | null,
        resources: ReadonlyArray<SpaceResource>
    ) {
        this._id = id
        this._name = name
        this._type = type
        this._location = location
        this._capacity = capacity
        this._status = status
        this._description = description
        this._resources = resources
    }

    public get id(): string {
        return this._id
    }

    public get name(): string {
        return this._name
    }

    public get type(): SpaceType {
        return this._type
    }

    public get location(): string {
        return this._location
    }

    public get capacity(): number {
        return this._capacity
    }

    public get status(): SpaceStatus {
        return this._status
    }

    public get description(): string | null {
        return this._description
    }

    public get resources(): ReadonlyArray<SpaceResource> {
        return this._resources
    }

    public static fromRow(row: Record<string, unknown>): Space {
        const resourcesValue = row.resources
        const resources = Array.isArray(resourcesValue)
            ? resourcesValue.map((resource) => resource as SpaceResource)
            : row.resource_id
              ? [
                    {
                        id: String(row.resource_link_id ?? row.resource_id),
                        resourceId: String(row.resource_id),
                        name: String(row.resource_name ?? ''),
                        description:
                            row.resource_description === null ||
                            row.resource_description === undefined
                                ? null
                                : String(row.resource_description),
                        status: String(row.resource_status ?? 'AVAILABLE'),
                        quantity: Number(row.quantity ?? 0)
                    }
                ]
              : []

        return new Space(
            String(row.id),
            String(row.name),
            String(row.type) as SpaceType,
            String(row.location),
            Number(row.capacity),
            String(row.status) as SpaceStatus,
            row.description === null || row.description === undefined
                ? null
                : String(row.description),
            resources
        )
    }
}
