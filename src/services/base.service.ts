import { Repository } from "typeorm";

export interface ServiceArgument {
  useSoftDeletes: boolean;
}

export abstract class Service {
  protected readonly _repository: Repository<any>;
  protected readonly _useSoftDeletes: boolean;

  constructor(repository: Repository<any>, args: ServiceArgument) {
    this._repository = repository;
    this._useSoftDeletes = args.useSoftDeletes || false;
  }

  abstract get(id: number): Promise<any>;

  abstract getMany(
    page: number,
    limit: number,
    sortBy: string,
    orderBy: string
  ): Promise<any[]>;

  async create(newData: any): Promise<any> {
    return this._repository.save(newData);
  }
  async update(id: number, updatedData: any): Promise<any> {
    return this._repository.update(id, updatedData);
  }
  async delete(id: number, userId: any): Promise<any> {
    if (this._useSoftDeletes) {
      return this._repository.softDelete(id);
    }
    return this._repository.delete(id);
  }
  async existe(id: number): Promise<boolean> {
    const recurso = await this._repository.findOne(id);
    return !!recurso;
  }
}
