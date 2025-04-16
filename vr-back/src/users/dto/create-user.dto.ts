import { DTO, DTOProperty } from '../../core/lib/typebox-dto';

@DTO()
export class CreateUserDto {
  @DTOProperty()
  public email!: string;

  @DTOProperty()
  public password!: string;
}
