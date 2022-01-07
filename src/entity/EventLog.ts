import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Event } from "./Event";
import { User } from "./User";

@Entity({ name: "event_logs" })
export class EventLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  module!: string;

  @Column({ type: "int" })
  event_id!: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: "event_id" })
  event!: Event;

  @Column({ type: "int" })
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at!: Date;
}
