import type { SpaceRepository } from '../repositories/SpaceRepository.js'
import type { Space } from './Space.js'

export class SpaceModel {
    public constructor(private readonly spaceRepository: SpaceRepository) {}

    public async listAvailable(): Promise<Space[]> {
        return this.spaceRepository.listAvailableSpacesWithResources()
    }
}
 