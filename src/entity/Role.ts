import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Permission } from "./Permission";
import { User } from "./User";

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  role!: string;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: "roles_permissions",
    joinColumn: {
      name: "role_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "permission_id",
      referencedColumnName: "id",
    },
  })
  permissions!: Permission[];

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
