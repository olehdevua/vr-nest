import { TSchema, TProperty } from '../../core/lib/typebox-schema';

@TSchema()
export class UpdateUserDto {
  @TProperty()
  name!: string;

  @TProperty()
  age!: number;
}
