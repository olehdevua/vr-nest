import { Type } from '@sinclair/typebox';
import { TSchema, TProperty } from '../../core/lib/typebox-schema';

@TSchema()
export class UpdateUserDto {
  @TProperty(Type.Optional(Type.String()))
  name: string | undefined;

  @TProperty(Type.Optional(Type.Number({ minimum: 7, maximum: 100 })))
  age: number | undefined;
}
