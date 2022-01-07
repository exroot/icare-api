import { Service } from "./base.service";
import { getRepository, Repository } from "typeorm";
import { IComment } from "../types/interfaces";
import { EventLog } from "../entity/EventLog";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class CommentService extends Service {
  private readonly _sortableColumns: string[];
  private readonly _relations: string[];
  private readonly _bitacoraRepo: Repository<EventLog>;

  constructor(commentRepo: Repository<any>) {
    super(commentRepo, { useSoftDeletes: true });
    this._relations = ["user", "user.profile"];
    this._sortableColumns = ["id", "user_id", "post_id"];
    this._bitacoraRepo = getRepository(EventLog);
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
      relations: this._relations,
    });
  }

  async create(commentData: IComment): Promise<IComment> {
    const newComment = await this._repository.save(commentData);
    // Crear record en bitacora
    if (!newComment) {
      // Si comment se devuelve nulo, retornar comment y no guardar la accion en bitacora
      return newComment;
    }
    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 1,
      module: "COMMENTS",
      user_id: newComment.user_id,
    });

    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    // Retornar nuevo comment al front
    return newComment;
  }

  async update(id: number, updatedData: any): Promise<any> {
    const data = { ...updatedData, id };
    const updatedComment = await this._repository.save(data);

    if (!updatedComment) {
      // Si post no se actualizo, retornar post y no guardar la accion en bitacora
      return updatedComment;
    }

    // Crear record en bitacora
    const bitacoraRecord = this._bitacoraRepo.create({
      event_id: 3,
      module: "COMMENTS",
      user_id: updatedData.user_id,
    });
    // Insertar record en tabla bitacora
    await this._bitacoraRepo.save(bitacoraRecord);

    // Retornar mensaje satisfactorio
    return updatedComment;
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
        [sortBy]: "ASC",
      },
      skip: page * limit - limit,
      relations: this._relations,
    });
  }
}
