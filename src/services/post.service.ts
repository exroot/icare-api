import { Service } from "./base.service";
import { Repository } from "typeorm";
import { IPost } from "../types/interfaces";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class PostService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];

  constructor(postRepo: Repository<any>) {
    super(postRepo, { useSoftDeletes: true });
    this._relations = ["comments", "categories", "user"];
    this._sortableColumns = ["id", "title", "categories", "user"];
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
  ): Promise<IPost[]> {
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

  async create(newPost: IPost): Promise<IPost> {
    return this._repository.save(newPost);
  }

  async update(id: number, updatedData: any): Promise<any> {
    return this._repository.update(id, updatedData);
  }

  async getFeedPosts(page: number, limit: number, userId: number) {
    const posts = await this._repository.query(`
    SELECT
        posts.id,
        posts.title,
        posts.created_at,
        posts.user_id,
        profiles.username,
        profiles.first_name,
        profiles.last_name,
        profiles.image_avatar,
        profiles.image_cover,
        profiles.follower_count,
        profiles.following_count,
        roles.role,
        email
    FROM posts
        INNER JOIN users
            ON posts.user_id = users.id 
        INNER JOIN profiles
            ON users.profile_id = profiles.id
        INNER JOIN roles
            ON users.rol_id = roles.id
    WHERE
        users.id != ${userId}
        AND EXISTS (
            SELECT
                *
            FROM
                following
            WHERE
                followed_id = users.id
                AND user_id = ${userId}
        )
    ORDER BY created_at 
    LIMIT ${limit} OFFSET ${page * limit - limit};`);

    const postsMapped = posts.map((post: any) => {
      return {
        profile: {
          username: post.username,
          user_id: post.user_id,
          first_name: post.first_name,
          last_name: post.last_name,
          image_avatar: post.image_avatar,
          image_cover: post.image_cover,
          follower_count: post.follower_count,
          following_count: post.following_count,
        },
        user: {
          id: post.user_id,
          email: post.email,
          role: post.role,
        },
        title: post.title,
        body: post.body,
        id: post.id,
      };
    });

    return postsMapped;
  }

  async search(title: string): Promise<IPost[]> {
    return this._repository
      .createQueryBuilder("Post")
      .where("Post.title LIKE :title", {
        title: `%${title}%`,
      })
      .orderBy("Post.created_at", "DESC")
      .limit(6)
      .getMany();
  }
}
