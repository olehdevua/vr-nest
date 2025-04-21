import { TProperty, TSchema } from '../../core/lib/typebox-schema';
import { Type } from '@sinclair/typebox';

@TSchema({ additionalProperties: false })
export class FindOneUserDto {
  @TProperty(Type.String({ format: 'uuid' }))
  id!: string;
}
