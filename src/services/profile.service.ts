import { Service } from "./base.service";
import { createQueryBuilder, getRepository, Not, Repository } from "typeorm";
import { IProfile } from "../types/interfaces";
import { Following } from "../entity/Following";
import jwt from "jsonwebtoken";
import { Profile } from "../entity/Profile";
import { User } from "../entity/User";

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

  async getByUsername(username: string, token: string | null): Promise<any> {
    const userRequester = await this.getUser(token);
    const userRequested = await this._repository.findOne({
      where: {
        username,
      },
      relations: this._relations,
    });

    if (!userRequested) {
      return null;
    }

    let isFollowing: any = false;
    if (userRequested && userRequester) {
      isFollowing = await this.isFollowing(userRequester.id, userRequested.id);
    }
    return { ...userRequested, following: isFollowing };
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

  async existeProfile(username: string): Promise<boolean> {
    console.log("username: ", username);
    const profile = await this._repository.findOne({
      where: {
        username,
      },
    });
    console.log("PERFIL: ", profile);
    return !!profile;
  }

  async create(newPost: IProfile): Promise<IProfile> {
    return this._repository.save(newPost);
  }

  async updateProfile(username: string, updatedData: any): Promise<any> {
    const profile = await this._repository.findOne({
      where: {
        username,
      },
    });
    return this._repository.save({ ...profile, ...updatedData });
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
      .createQueryBuilder("Profile")
      .where("Profile.first_name LIKE :first_name", {
        first_name: `%${text}%`,
      })
      .orWhere("Profile.last_name LIKE :last_name", {
        last_name: `%${text}%`,
      })
      .orWhere("Profile.username LIKE :username", {
        username: `%${text}%`,
      })
      .orderBy("Profile.created_at", "DESC")
      .limit(6)
      .getMany();
  }

  async getUser(token: string | null): Promise<any> {
    let userDecoded: any = null;
    if (!token) {
      return false;
    }
    jwt.verify(token, process.env.JWT_SECRET || "", (err, decodedToken) => {
      if (err) {
        return;
      }
      userDecoded = decodedToken;
    });
    return userDecoded;
  }

  async getFollowers(username: string) {
    const profile = await this._repository.findOne({
      where: { username },
      relations: ["user"],
    });
    const followRepo = getRepository(Following);
    const followersResults = await followRepo.find({
      where: {
        followed_id: profile.user.id,
      },
      select: ["user_id"],
    });
    const followingResults = await followRepo.find({
      where: {
        user_id: profile.user.id,
      },
      select: ["followed_id"],
    });
    const followersIds = followersResults.map((record) => record.user_id);
    const followingIds = followingResults.map((record) => record.followed_id);

    let followers: any[] = [],
      following: any[] = [];
    if (followersIds.length) {
      followers = await createQueryBuilder(User, "user")
        .where("user.id IN(:...ids)", { ids: followersIds })
        .leftJoinAndSelect("user.profile", "profile")
        .getMany();
    }
    if (followingIds.length) {
      following = await createQueryBuilder(User, "user")
        .where("user.id IN(:...ids)", { ids: followingIds })
        .leftJoinAndSelect("user.profile", "profile")
        .getMany();
    }
    return {
      follower_list: followers,
      following_list: following,
    };
  }

  async getSuggested(userId: number | string): Promise<any> {
    const followRepo = getRepository(Following);
    const followingResults = await followRepo.find({
      where: {
        user_id: userId,
      },
      select: ["followed_id"],
    });
    const followingIds = followingResults.map((record) => record.followed_id);
    const suggesteds = await createQueryBuilder(User, "user")
      .where("user.id NOT IN(:...ids)", { ids: [...followingIds, userId] })
      .leftJoinAndSelect("user.profile", "profile")
      .take(5)
      .getMany();

    const suggestions = suggesteds.map((record) => {
      const { profile, ...user } = record;
      return { ...profile, user: user };
    });
    // const suggested = await this._repository.find({
    //   where: { user_id: Not(userId) },
    //   take: 5,
    //   relations: this._relations,
    // });
    return suggestions;
  }
}
