import { Service } from "./base.service";
import { Repository } from "typeorm";
import { ICategory } from "../types/interfaces";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class CategoryService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];

  constructor(categoryRepo: Repository<any>) {
    super(categoryRepo, { useSoftDeletes: true });
    this._relations = ["posts"];
    this._sortableColumns = ["id", "category"];
  }

  async get(id: number): Promise<any> {
    return this._repository.findOne(id);
  }

  async getMany(
    page: number,
    limit: number,
    sortBy: string,
    orderBy: string
  ): Promise<ICategory[]> {
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

  async create(newCategory: ICategory): Promise<ICategory> {
    return this._repository.save(newCategory);
  }

  async update(id: number, updatedData: any): Promise<any> {
    return this._repository.update(id, updatedData);
  }

  async search(category: string): Promise<ICategory[]> {
    return this._repository
      .createQueryBuilder("Category")
      .where("Post.category LIKE :category", {
        category: `%${category}%`,
      })
      .orderBy("Category.created_at", "DESC")
      .limit(6)
      .getMany();
  }
}
