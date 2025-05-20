import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersCreateService } from './services/users-create.service';
import { UsersUpdateService } from './services/users-update.service';

@Controller('users')
export class UsersController {
  constructor(
    protected readonly usersService: UsersService,
    protected readonly usersCreateService: UsersCreateService,
    protected readonly usersUpdateService: UsersUpdateService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersCreateService.execute(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersUpdateService.execute(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
