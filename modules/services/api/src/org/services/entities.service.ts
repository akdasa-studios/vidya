import { validate, ValidationError } from 'class-validator';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export interface BaseModel {
  id: string;
}

export class EntitiesService<TEntity extends BaseModel> {
  constructor(protected readonly repository: Repository<TEntity>) {}

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

  async findAll(query?: FindManyOptions<TEntity>): Promise<TEntity[]> {
    return await this.repository.find(query);
  }

  async findOneBy(query: FindOptionsWhere<TEntity>): Promise<TEntity> {
    return await this.repository.findOneBy(query);
  }

  async updateOneBy(
    query: FindOptionsWhere<TEntity>,
    request: DeepPartial<TEntity>,
  ): Promise<TEntity> {
    const entity = await this.repository.findOneBy(query);
    const updated = this.repository.merge(entity, request);
    return await this.repository.save(updated);
  }
}
