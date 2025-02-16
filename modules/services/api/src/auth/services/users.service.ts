import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@vidya/entities';
import { Repository } from 'typeorm';

export type LoginField = 'email' | 'phone';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.users.findOneBy({ id });
  }

  async getOrCreateByLogin(
    loginField: LoginField,
    login: string,
  ): Promise<User> {
    const existingUser = await this.users.findOneBy({ [loginField]: login });
    if (existingUser) {
      return existingUser;
    }

    const newUser = this.users.create({
      [loginField]: login,
    });
    return await this.users.save(newUser);
  }
}
