import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';
import { validate } from '../../core/lib/typebox-schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepo } from '../repos/user.repo';
import { User } from '../entities/user.entity';
import { instanceToPlain } from 'class-transformer';
import { UserDto } from '../dto/user.dto';
import { ResourceDTO } from '../../core/types';

@Injectable()
export class UsersCreateService {
  constructor(
    protected readonly userRepo: UserRepo,
    @InjectPinoLogger(UsersCreateService.name)
    protected readonly logger: PinoLogger,
  ) {}

  async execute(body: unknown): Promise<ResourceDTO<UserDto>> {
    const result = validate(CreateUserDto, body);
    const errors = [...result];
    if (errors.length > 0) {
      this.logger.error(errors);
      return { errors };
    }

    const user: User = await User.create(body as CreateUserDto);
    this.logger.debug('created user', user);

    user.id = await this.userRepo.createUser(user);

    // const dto = instanceToPlain(user);
    // const errors1 = [...validate(UserDto, dto)];
    // if (errors1.length > 0) {
    //   this.logger.error(errors1);
    //   return { errors: errors1 };
    // }
    //
    // return dto as UserDto;

    const content = instanceToPlain(user) as UserDto;

    return { content };
  }
}
