import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User) protected readonly repository: Repository<User>,
  ) {}

  async createUser(user: User): Promise<any> {
    // const user = User.create(createUserDto);
    // const user = this.repository.create(createUserDto);

    const insertRes = await this.repository.insert(user);

    return insertRes.generatedMaps;
  }

  findAll(): Promise<User[]> {
    // return this.repository.find({ where: { email: 'oleh-1@mail.com' } });
    return this.repository.find();
  }

  findOne({ id }: { id: string }): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}
