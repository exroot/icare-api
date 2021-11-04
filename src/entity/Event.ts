import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  body!: string;
}
