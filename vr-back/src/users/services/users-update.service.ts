import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UserRepo } from '../repos/user.repo';
import { UpdateUserDto } from '../dto/update-user.dto';
import { validate } from '../../core/lib/typebox-schema';
import { ResourceDTO } from '../../core/types';

@Injectable()
export class UsersUpdateService {
  constructor(
    protected readonly userRepo: UserRepo,
    @InjectPinoLogger(UsersUpdateService.name)
    protected readonly logger: PinoLogger,
  ) {}

  async execute(
    id: string,
    body: unknown,
  ): Promise<ResourceDTO<{ id: string }>> {
    this.logger.info('start update user', { id, body });

    const result = validate(UpdateUserDto, body);
    const errors = [...result];
    if (errors.length > 0) {
      this.logger.error(errors);
      return { errors };
    }

    const user = await this.userRepo.findOneById({ id, select: ['id'] });
    if (!user) {
      throw new Error(`User not found. id=${id}`);
    }

    this.logger.debug('update user', user);
    await this.userRepo.update(id, body as UpdateUserDto);
    this.logger.info('user updated', user);

    return { content: { id } };
  }
}
