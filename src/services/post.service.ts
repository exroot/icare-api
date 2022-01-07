import { Service } from "./base.service";
import { getRepository, Repository } from "typeorm";
import { IPost } from "../types/interfaces";
import { EventLog } from "../entity/EventLog";
import { Category } from "../entity/Category";
import { Post } from "../entity/Post";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class PostService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];
  private readonly _bitacoraRepo: Repository<EventLog>;
  private readonly _categoryRepo: Repository<Category>;

  constructor(postRepo: Repository<any>) {
    super(postRepo, { useSoftDeletes: true });
    this._relations = ["comments", "categories", "user", "user.profile"];
    this._sortableColumns = ["id", "title", "categories", "user"];
    this._bitacoraRepo = getRepository(EventLog);
    this._categoryRepo = getRepository(Category);
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
      take: limit,
    });
  }

  // Event id
  // 1 | CREATE
  // 2 | READ
  // 3 | UPDATE
  // 4 | DELETE

  async create(postData: IPost): Promise<IPost> {
    const content = postData.body;
    let tagsList: any = [];
    if (content) tagsList = content.match(/#\S+/g);

    if (tagsList && tagsList.length) {
      const parsedTags = tagsList.map((tag: any) => {
        return { category: tag };
      });

      const tagsSaved = await this._categoryRepo.find({
        where: parsedTags,
      });

      const tagsNotSaved = parsedTags.filter((tag: any) => {
        const tagsSavedNames = tagsSaved.map((tagSav) => tagSav.category);
        if (tagsSavedNames.includes(tag.category)) {
          return;
        }
        return tag;
      });
      const newTags = await this._categoryRepo
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values(tagsNotSaved)
        .orIgnore("category")
        .execute();

      // console.log("tags: ", tags);
      const savedTagsIds = await this._categoryRepo.find({
        select: ["id"],
        where: parsedTags,
      });
      const tagsIds = savedTagsIds.map((tag) => tag.id);
      const newTagsIds = newTags.identifiers.map((identifier) => identifier.id);
      tagsList = tagsIds.concat(newTagsIds);
    }

    const newPost = await this._repository.save(postData);

    // await this._rolesRepository
    //     .createQueryBuilder()
    //     .relation(Role, "permissions")
    //     .of(adminRole)
    //     .add(permissionsIds);

    await this._repository
      .createQueryBuilder()
      .relation(Post, "categories")
      .of(newPost)
      .add(tagsList ? tagsList : []);
    if (!newPost) {
      // Si post se devuelve nulo, retornar post y no guardar la accion en bitacora
      return newPost;
    }

    // Crear record en bitacora
    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 1,
      module: "POSTS",
      user_id: newPost.user_id,
    });
    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    // Retornar nuevo post al front
    return newPost;
  }

  async update(id: number, updatedData: any): Promise<any> {
    const data = { ...updatedData, id };
    const updatedPost = await this._repository.save(data);
    if (!updatedPost) {
      // Si post no se actualizo, retornar post y no guardar la accion en bitacora
      return updatedPost;
    }

    // Crear record en bitacora
    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 3,
      module: "POSTS",
      user_id: updatedData.user_id,
    });
    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    // Retornar mensaje satisfactorio
    return updatedPost;
  }

  async delete(id: number, userId: any): Promise<any> {
    let deletedPost: any = null;
    if (this._useSoftDeletes) {
      // Condicion para softdeletes o no
      deletedPost = await this._repository.softDelete(id);
    } else {
      deletedPost = await this._repository.delete(id);
    }
    if (!deletedPost.affected) {
      // Si post no se elimino, retornar post y no guardar la accion en bitacora
      return deletedPost;
    }
    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 4,
      module: "POSTS",
      user_id: userId,
    });

    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    // Retornar mensaje satisfactorio al front
    return deletedPost;
  }

  async getFeedPosts(page: number, limit: number, userId: number) {
    const posts = await this._repository.query(`
    SELECT
        posts.id,
        posts.title,
        posts.created_at,
        posts.user_id,
        posts.body,
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
    ORDER BY created_at DESC 
    LIMIT ${limit} OFFSET ${page * limit - limit};`);

    const postsMapped = posts.map((post: any) => {
      const categories = post.body.match(/#\S+/g);
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
        categories: categories || [],
        created_at: post.created_at,
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
