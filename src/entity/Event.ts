import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event!: string;
}
