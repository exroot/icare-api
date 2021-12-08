import { Service } from "./base.service";
import { getRepository, Repository } from "typeorm";
import { IProfile } from "../types/interfaces";
import { Following } from "../entity/Following";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class ProfileService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];
  private readonly _followStateRepo: Repository<Following> =
    getRepository(Following);

  constructor(profileRepo: Repository<any>) {
    super(profileRepo, { useSoftDeletes: true });
    this._relations = ["user"];
    this._sortableColumns = ["id"];
  }

  async get(id: number): Promise<any> {
    return this._repository.findOne(id, {
      relations: this._relations,
    });
  }

  async getMany(
    page: number,
    limit: number,
    sortBy: string,
    orderBy: string
  ): Promise<IProfile[]> {
    if (!this._sortableColumns.includes(sortBy)) {
      sortBy = "id";
    }
    return this._repository.find({
      order: {
        [sortBy]: orderBy as OrderBy,
      },
      skip: page * limit - limit,
    });
  }

  async create(newPost: IProfile): Promise<IProfile> {
    return this._repository.save(newPost);
  }

  async update(id: number, updatedData: any): Promise<any> {
    return this._repository.update(id, updatedData);
  }

  async isFollowing(user_id: number, followedId: number) {
    const followStatus = await this._followStateRepo.findOne({
      where: {
        user_id,
        followed_id: followedId,
      },
    });
    if (!followStatus) {
      return false;
    }
    return true;
  }

  async follow(followerId: number, followedId: number) {
    if (followerId === followedId) {
      return false;
    }
    const followInfo = this._followStateRepo.create({
      user_id: followerId,
      followed_id: followedId,
    });
    await this._followStateRepo.save(followInfo);
    return true;
  }

  async unfollow(followerId: number, unfollowId: number) {
    const record = await this._followStateRepo.findOne({
      where: {
        user_id: followerId,
        followed_id: unfollowId,
      },
    });
    if (!record) {
      return false;
    }
    return this._followStateRepo.remove(record);
  }

  async search(text: string): Promise<IProfile[]> {
    return this._repository
      .createQueryBuilder("Post")
      .where("Profile.first_name LIKE :first_name", {
        first_name: `%${text}%`,
      })
      .orWhere("Profile.last_name LIKE :last_name", {
        last_name: `%${text}%`,
      })
      .orWhere("Profile.username LIKE :username", {
        username: `%${text}%`,
      })
      .orderBy("Post.created_at", "DESC")
      .limit(6)
      .getMany();
  }
}
