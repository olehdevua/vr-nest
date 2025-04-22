import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User) protected readonly repository: Repository<User>,
  ) {}

  async createUser(user: User): Promise<string> {
    // const user = User.create(createUserDto);
    // const user = this.repository.create(createUserDto);

    const insertRes = await this.repository.insert(user);

    const recordMap = insertRes.generatedMaps[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const id = recordMap && recordMap['id'];

    if (typeof id !== 'string') {
      throw new TypeError(`Id must be a string, id=${id}`);
    }

    return id;
  }

  findAll(): Promise<User[]> {
    // return this.repository.find({ where: { email: 'oleh-1@mail.com' } });
    return this.repository.find();
  }

  findOne({ id }: { id: string }): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}
