import 'reflect-metadata';
import * as box from '@sinclair/typebox';
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler';
import { Type } from '@nestjs/common';

/**
 * https://docs.nestjs.com/controllers#request-payloads
 *
 * Why we recommend using classes here?
 * Classes are part of the JavaScript ES6 standard,
 * so they remain intact as real entities in the compiled JavaScript.
 * In contrast, TypeScript interfaces are removed during transpilation,
 * meaning Nest can't reference them at runtime.
 * This is important because features like Pipes rely on having access
 * to the metatype of variables at runtime,
 * which is only possible with classes.
 */

export const TYPEBOX_PROPERTIES = 'typebox:properties';
export const TYPEBOX_SCHEMA = 'typebox:schema';
export const compiledSchemas: Map<Type, TypeCheck<any>> = new Map();

const SIMPLE_TYPES = ['Symbol', 'String', 'Number', 'Date', 'Boolean'];

export function validate(object: unknown, dtoClass: Type) {
  const boxSchema = Reflect.getMetadata(TYPEBOX_SCHEMA, dtoClass) as
    | box.TObject<box.TProperties>
    | undefined;

  if (!boxSchema) {
    throw new TypeError('Bad object');
  }

  let validator = compiledSchemas.get(dtoClass);

  if (!validator) {
    validator = TypeCompiler.Compile(boxSchema);
    compiledSchemas.set(dtoClass, validator);
  }

  return validator.Errors(object);
}

export function DTO() {
  return function defineTypeboxDTO(target: Type) {
    const dtoObjectValidator = Reflect.getMetadata(
      TYPEBOX_PROPERTIES,
      target,
    ) as box.TProperties;

    if (!dtoObjectValidator) {
      return;
    }

    Reflect.defineMetadata(
      TYPEBOX_SCHEMA,
      box.Type.Object(dtoObjectValidator),
      target,
    );
  };
}

export function DTOProperty(validator?: box.TSchema) {
  return function defineTypeboxDTOProperty(
    prototype: object,
    propertyName: string | symbol,
  ) {
    if (typeof propertyName === 'symbol') return;

    const constructor = prototype.constructor;

    if (!Reflect.hasMetadata(TYPEBOX_PROPERTIES, constructor)) {
      Reflect.defineMetadata(TYPEBOX_PROPERTIES, {}, constructor);
    }

    const dtoObjectValidator = Reflect.getMetadata(
      TYPEBOX_PROPERTIES,
      constructor,
    ) as box.TProperties;

    if (validator) {
      dtoObjectValidator[propertyName] = validator;
      return;
    }

    const propertyType = Reflect.getMetadata(
      'design:type',
      prototype,
      propertyName,
    ) as Function | undefined; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

    if (typeof propertyType !== 'function') {
      dtoObjectValidator[propertyName] = box.Type.Undefined(); // or Null
      return;
    }

    const typeName = propertyType.name;

    if (SIMPLE_TYPES.includes(typeName)) {
      const builder = box.Type[typeName as keyof typeof box.Type];
      dtoObjectValidator[propertyName] = (builder as () => box.TSchema)();
      return;
    }

    if (typeName === 'Array') {
      dtoObjectValidator[propertyName] = box.Type.Array(box.Type.Any());
      return;
    }

    if (typeName === 'Object') {
      dtoObjectValidator[propertyName] = box.Type.Object({});
      return;
    }

    const propertySchema = Reflect.getMetadata(
      TYPEBOX_SCHEMA,
      propertyType,
    ) as box.TSchema;

    if (propertySchema) {
      dtoObjectValidator[propertyName] = propertySchema;
      return;
    }

    dtoObjectValidator[propertyName] = box.Type.Any();
  };
}
