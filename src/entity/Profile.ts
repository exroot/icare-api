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

@Entity({ name: "profiles" })
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  first_name!: string;

  @Column({ nullable: true })
  last_name!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  bio!: string;

  @Column({ nullable: true })
  location_country!: string;

  @Column({ nullable: true })
  location_city!: string;

  @Column({ nullable: true })
  image_avatar!: string;

  @Column({ nullable: true })
  image_cover!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ type: "int", default: 0 })
  follower_count!: number;

  @Column({ type: "int", default: 0 })
  following_count!: number;

  @Column({ type: "int", nullable: true })
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
