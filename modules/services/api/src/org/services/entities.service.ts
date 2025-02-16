import { validate, ValidationError } from 'class-validator';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export abstract class EntitiesService<TEntity extends object> {
  constructor(protected readonly repository: Repository<TEntity>) {}

  /**
   * Creates a new entity based on the provided request.
   *
   * @param request - A partial object containing the properties to create the entity.
   * @returns A promise that resolves to the created entity.
   * @throws ValidationError - If the validation of the entity fails.
   */
  async create(request: DeepPartial<TEntity>): Promise<TEntity> {
    const entity = this.repository.create(request);
    const errors = await validate(entity);
    if (errors.length == 0) {
      return await this.repository.save(request);
    } else {
      // TODO: Catch error correctrly. Endpoint returns 500
      throw new ValidationError();
    }
  }

  /**
   * Finds one entity based on the provided query.
   *
   * @param query The query to filter the entity.
   * @returns A promise that resolves to the entity.
   */
  async findOneBy(query: FindOptionsWhere<TEntity>): Promise<TEntity> {
    return await this.repository.findOneBy(query);
  }

  /**
   * Finds all entities based on the provided query.
   *
   * @param query The query to filter the entities.
   * @returns A promise that resolves to an array of entities.
   */
  async findAllBy(query?: FindManyOptions<TEntity>): Promise<TEntity[]> {
    return await this.repository.find(query);
  }

  /**
   * Updates an entity based on the provided query and request.
   *
   * @param query Query to filter the entity
   * @param request Request to update the entity
   * @returns A promise that resolves to the updated entity.
   */
  async updateOneBy(
    query: FindOptionsWhere<TEntity>,
    request: DeepPartial<TEntity>,
  ): Promise<TEntity> {
    const entity = await this.repository.findOneBy(query);
    const updated = this.repository.merge(entity, request);
    return await this.repository.save(updated);
  }

  /**
   * Deletes an entity based on the provided query.
   *
   * @param query Query to filter the entity
   */
  async deleteOneBy(query: FindOptionsWhere<TEntity>): Promise<void> {
    const entity = await this.repository.findOneBy(query);
    await this.repository.remove(entity);
  }
}
