import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "./Role";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  permission!: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

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
