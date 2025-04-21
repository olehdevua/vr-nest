import * as crypto from 'crypto';
import * as uuid from 'uuid';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Exclude } from 'class-transformer';

@Entity('users', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid.v1();

  @Column('varchar', { nullable: true })
  name: string | undefined;

  @Column('text')
  email!: string;

  @Column('bytea')
  @Exclude({ toPlainOnly: true })
  password_hash!: Buffer;

  @Column('bytea')
  @Exclude({ toPlainOnly: true })
  password_salt!: Buffer;

  static async create(dto: CreateUserDto): Promise<User> {
    const user = new User();

    const [password_hash, password_salt] = await this.encodePassword(
      dto.password,
    );

    user.email = dto.email;
    user.password_hash = password_hash;
    user.password_salt = password_salt;

    return user;
  }

  // create extension pgcrypto;
  // INSERT INTO users (id, email, password, name)
  // VALUES ('9554c2f0-1e5c-11...', 'foo-1@bar.com', crypt('deadbeef', gen_salt('bf')), null);
  //
  // ^- stupid example, since blog-author doesn't store 'salt'
  //
  static async encodePassword(password: string): Promise<[Buffer, Buffer]> {
    const salt: Buffer = await randomBuffer(32);

    const passwordHash: Buffer = await new Promise((resolve, reject) => {
      return crypto.pbkdf2(password, salt, 100000, 64, 'sha256', (err, buf) => {
        return err ? reject(err) : resolve(buf);
      });
    });

    return [passwordHash, salt];
  }
}

function randomBuffer(len: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(len, (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
}
