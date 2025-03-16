import { UserPermissions } from '@vidya/api/auth/utils';
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
   * Checks if an entity exists based on the provided query.
   * @param query The query to filter the entity.
   * @returns A promise that resolves to a boolean.
   */
  async existsBy(query: FindOptionsWhere<TEntity>): Promise<boolean> {
    return await this.repository.existsBy(query);
  }

  /**
   * Finds one entity based on the provided query.
   * @param query The query to filter the entity.
   * @returns A promise that resolves to the entity.
   */
  async findOneBy(query: FindOptionsWhere<TEntity>): Promise<TEntity> {
    return await this.repository.findOneBy(query);
  }

  /**
   * Finds all entities based on the provided query.
   * @param query The query to filter the entities.
   * @returns A promise that resolves to an array of entities.
   */
  async findAll(query?: FindManyOptions<TEntity>): Promise<TEntity[]> {
    return await this.repository.find(query);
  }

  /**
   * Updates an entity based on the provided query and request.
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
   * @param query Query to filter the entity
   */
  async deleteOneBy(query: FindOptionsWhere<TEntity>): Promise<void> {
    const entity = await this.repository.findOneBy(query);
    await this.repository.remove(entity);
  }
}

/**
 * A service that provides scopped access to entities.
 *  @typeparam TEntity The entity type.
 *  @typeparam TScope The scope type.
 */
export class ScopedEntitiesService<
  TEntity extends object,
  TScope extends object,
> extends EntitiesService<TEntity> {
  /**
   * Creates a new instance of the ScopedEntitiesService.
   * @param repository The repository to access the entities.
   * @param applyScope The function to apply the scope to the query.
   * @returns A new instance of the ScopedEntitiesService.
   */
  constructor(
    repository: Repository<TEntity>,
    private readonly applyScope: (
      query: FindManyOptions<TEntity>,
      scope: TScope,
    ) => FindManyOptions<TEntity>,
  ) {
    super(repository);
  }

  /**
   * Scopes the request by the provided scope.
   * @param scope Scope to apply to the query.
   * @returns Scoped request.
   */
  scopedBy(scope: TScope) {
    const scopedQuery = (scope: TScope) => (query: FindManyOptions<TEntity>) =>
      this.applyScope(query, scope);
    return new ScopedEntitiesServiceRequest<TEntity>(this, scopedQuery(scope));
  }
}

/**
 * A request to access entities with a scope.
 * @typeparam TEntity The entity type.
 */
export class ScopedEntitiesServiceRequest<TEntity extends object> {
  /**
   * Creates a new instance of the ScopedEntitiesServiceRequest.
   * @param service Service to access the entities.
   * @param applyScope A function to apply the scope to the query.
   */
  constructor(
    private readonly service: EntitiesService<TEntity>,
    private readonly applyScope: (
      query: FindManyOptions<TEntity>,
    ) => FindManyOptions<TEntity>,
  ) {}

  /**
   * Finds all entities based on the provided query and scope.
   * @param query Query to filter the entities.
   * @returns Filtered entities.
   */
  async findAll(query?: FindManyOptions<TEntity>): Promise<TEntity[]> {
    return await this.service.findAll(this.applyScope(query));
  }

  async findOne(query: FindManyOptions<TEntity>): Promise<TEntity | null> {
    const result = await this.findAll(query);
    if (result.length === 0) {
      return null;
    }
    if (result.length > 1) {
      throw new Error('Multiple entities found');
    }
    return result[0];
  }
}

export type Scope = {
  permissions: UserPermissions;
};
