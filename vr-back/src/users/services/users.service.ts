import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepo } from '../repos/user.repo';
import { validate } from '../../core/lib/typebox-schema';
import { FindOneUserDto } from '../dto/find-one-user.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    protected readonly userRepo: UserRepo,
    @InjectPinoLogger(UsersService.name) protected readonly logger: PinoLogger,
  ) {}

  async findAll() {
    const users = await this.userRepo.findAll();
    const usersDTO = instanceToPlain(users);
    this.logger.debug('findAll users', users);
    return { users: usersDTO };
  }

  async findOne(query: unknown) {
    const result = validate(FindOneUserDto, query);
    const errors = [...result];
    if (errors.length > 0) {
      this.logger.error(errors);
      return { errors };
    }

    const user = await this.userRepo.findOne(query as FindOneUserDto);
    const userDTO = instanceToPlain(user);
    return { content: userDTO };
  }

  update(id: number, _updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
