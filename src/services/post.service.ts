import { Service } from "./base.service";
import { Repository } from "typeorm";
import { IPost } from "../constants/interfaces";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class PostService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];

  constructor(tareaRepo: Repository<IPost>) {
    super(tareaRepo, { useSoftDeletes: true });
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
