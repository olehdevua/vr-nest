import { Type } from '@sinclair/typebox';
import { TSchema, TProperty } from '../../core/lib/typebox-schema';

@TSchema({ additionalProperties: false })
export class CreateUserDto {
  @TProperty(Type.String({ format: 'email' }))
  public email!: string;

  @TProperty(Type.String({ format: 'password' }))
  public password!: string;
}
