import { DTO, DTOProperty } from '../../core/lib/typebox-dto';

@DTO()
export class UpdateUserDto {
  @DTOProperty()
  name!: string;

  @DTOProperty()
  age!: number;
}
