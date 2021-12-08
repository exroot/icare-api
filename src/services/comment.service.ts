import { Service } from "./base.service";
import { Repository } from "typeorm";
import { IComment } from "../types/interfaces";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class CommentService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];

  constructor(commentRepo: Repository<any>) {
    super(commentRepo, { useSoftDeletes: true });
    this._relations = ["user"];
    this._sortableColumns = ["id", "user_id", "post_id"];
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
  ): Promise<IComment[]> {
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

  async create(newComment: IComment): Promise<IComment> {
    return this._repository.save(newComment);
  }

  async update(id: number, updatedData: any): Promise<any> {
    return this._repository.update(id, updatedData);
  }

  async getCommentsByPostId(
    postId: number,
    page: number,
    limit: number,
    sortBy: string,
    orderBy: string
  ): Promise<IComment[]> {
    if (!this._sortableColumns.includes(sortBy)) {
      sortBy = "id";
    }
    return this._repository.find({
      where: {
        post_id: postId,
      },
      order: {
        [sortBy]: orderBy as OrderBy,
      },
      skip: page * limit - limit,
    });
  }
}
