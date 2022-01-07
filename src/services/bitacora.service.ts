import { getRepository, Repository } from "typeorm";
import { IPermission } from "../types/interfaces";
import jwt from "jsonwebtoken";
import { EventLog } from "../entity/EventLog";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class BitacoraService {
  protected _bitacoraRepo: Repository<EventLog>;
  protected _relations: string[];

  constructor() {
    this._bitacoraRepo = getRepository(EventLog);
    this._relations = ["event", "user", "user.profile"];
  }

  async getMany(
    page: number,
    limit: number,
    sortBy: string,
    orderBy: string,
    q: string,
    identifier: string
  ) {
    let args: any = {};
    if (q === "module") {
      args = {
        order: {
          [sortBy]: orderBy as OrderBy,
        },
        skip: page * limit - limit,
        take: limit,
        where: {
          module: identifier,
        },
      };
    } else if (q === "event") {
      args = {
        order: {
          [sortBy]: orderBy as OrderBy,
        },
        skip: page * limit - limit,
        take: limit,
        where: {
          event_id: identifier,
        },
      };
    } else if (q === "user") {
      args = {
        order: {
          [sortBy]: orderBy as OrderBy,
        },
        skip: page * limit - limit,
        take: limit,
        where: {
          user_id: identifier,
        },
      };
    } else {
      args = {
        order: {
          [sortBy]: orderBy as OrderBy,
        },
        skip: page * limit - limit,
        take: limit,
      };
    }
    return this._bitacoraRepo.find({ ...args, relations: this._relations });
  }
}
