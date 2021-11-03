import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  image_avatar!: string;

  @Column()
  image_cover!: string;

  @Column({ type: "int" })
  follower_count!: number;

  @Column({ type: "int" })
  following_count!: number;

  @Column({ type: "int" })
  user_id!: number;

  @OneToOne(() => User, (user) => user.profile)
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
