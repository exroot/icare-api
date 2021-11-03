import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  body!: string;

  @Column({ type: "int" })
  post_id!: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: "post_id" })
  post!: Post;

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

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;

  @DeleteDateColumn({ select: false })
  deleted_at!: Date;
}
