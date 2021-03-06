import { compare, hashSync } from "bcryptjs";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Profile } from "./Profile";
import { Role } from "./Role";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: "int", nullable: true })
  profile_id!: number;

  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn({ name: "profile_id" })
  profile!: Profile;

  @Column({ type: "int", default: 4 })
  rol_id!: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "rol_id" })
  role!: Role;

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

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password) {
      this.password = hashSync(
        this.password,
        parseInt(process.env.HASH_SALT || "")
      );
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  }
}
