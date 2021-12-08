import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  AfterRemove,
  getConnection,
  AfterInsert,
} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Following {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  followed_id!: number;

  @Column({ default: false })
  notifications!: boolean;

  @AfterInsert()
  async follow() {
    await getConnection()
      .createQueryBuilder()
      .update(Profile)
      .set({ following_count: () => "following_count + 1" })
      .where("user_id = :id", { id: this.user_id })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .update(Profile)
      .set({ follower_count: () => "follower_count + 1" })
      .where("user_id = :id", { id: this.followed_id })
      .execute();
  }

  @AfterRemove()
  async unfollow() {
    await getConnection()
      .createQueryBuilder()
      .update(Profile)
      .set({ following_count: () => "following_count - 1" })
      .where("user_id = :id", { id: this.user_id })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .update(Profile)
      .set({ follower_count: () => "follower_count - 1" })
      .where("user_id = :id", { id: this.followed_id })
      .execute();
  }
}
