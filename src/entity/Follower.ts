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
export class Follower {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  profile_id_1!: number;

  @Column()
  profile_id_2!: number;

  @AfterInsert()
  async follow() {
    await getConnection()
      .createQueryBuilder()
      .update(Profile)
      .set({ following_count: () => "following_count + 1" })
      .where("id = :id", { id: this.profile_id_1 })
      .set({ follower_count: () => "follower_count + 1" })
      .where("id = :id", { id: this.profile_id_2 })
      .execute();
  }

  @AfterRemove()
  async unfollow() {
    await getConnection()
      .createQueryBuilder()
      .update(Profile)
      .set({ following_count: () => "following_count - 1" })
      .where("id = :id", { id: this.profile_id_1 })
      .set({ follower_count: () => "follower_count - 1" })
      .where("id = :id", { id: this.profile_id_2 })
      .execute();
  }
}
