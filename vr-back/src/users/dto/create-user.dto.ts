import { Type, Static } from '@sinclair/typebox';

const T = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number(),
});

type CreateUserDtoType = Static<typeof T>;

export class CreateUserDto implements CreateUserDtoType {
  x!: number;
  y!: number;
  z!: number;
}
