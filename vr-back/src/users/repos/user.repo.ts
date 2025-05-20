import { Injectable } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';

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

  async update(id: string, user: UpdateUserDto) {
    await this.repository.update(id, user);
  }

  findAll(): Promise<User[]> {
    // return this.repository.find({ where: { email: 'oleh-1@mail.com' } });
    return this.repository.find();
  }

  findOneById({
    id,
    select,
  }: {
    id: string;
    select?: (keyof User)[];
  }): Promise<User | null> {
    const query: FindOneOptions<User> = { where: { id } };
    if (select) query.select = select;

    return this.repository.findOne(query);
  }
}
