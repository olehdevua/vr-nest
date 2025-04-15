import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;
}
