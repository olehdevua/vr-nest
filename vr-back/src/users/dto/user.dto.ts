import { TProperty, TSchema } from '../../core/lib/typebox-schema';

@TSchema()
export class UserDto {
  @TProperty()
  id!: string;

  @TProperty()
  email!: string;

  @TProperty()
  name?: string;
}
