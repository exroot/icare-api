import { getRepository, Repository, Between } from "typeorm";
import { startOfDay, endOfDay } from "date-fns";
import { IPermission } from "../types/interfaces";
import jwt from "jsonwebtoken";
import { EventLog } from "../entity/EventLog";
import { addYears, subYears } from "date-fns";
import moment from "moment";
import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { Comment } from "../entity/Comment";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class BitacoraService {
  protected _bitacoraRepo: Repository<EventLog>;
  protected _postsRepo: Repository<Post>;
  protected _commentsRepo: Repository<Comment>;
  protected _usersRepo: Repository<User>;
  protected _relations: string[];

  constructor() {
    this._bitacoraRepo = getRepository(EventLog);
    this._relations = ["event", "user", "user.profile"];
    this._postsRepo = getRepository(Post);
    this._commentsRepo = getRepository(Comment);
    this._usersRepo = getRepository(User);
  }

  async getMany(
    page: number,
    limit: number,
    sortBy: string,
    orderBy: string,
    q: string,
    identifier: string,
    date_start: string,
    date_end: string
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
    if (date_start && date_end) {
      console.log("start: ", date_start);
      console.log("end: ", date_end);
      const dateStart = moment(date_start, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
      const dateObjectStart = dateStart.toDate(); // convert moment.js object to Date object

      const dateEnd = moment(date_end, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
      const dateObjectEnd = dateEnd.toDate(); // convert moment.js object to Date object

      const dates = Between(
        dateObjectStart.toISOString(),
        dateObjectEnd.toISOString()
      );

      args = {
        ...args,
        where: {
          ...args.where,
          created_at: dates,
        },
      };
    }
    return this._bitacoraRepo.find({ ...args, relations: this._relations });
  }

  async getReport(module: string, date_start: string, date_end: string) {
    const dateStart = moment(date_start, "DD-MM-yyyy"); // 1st argument - string, 2nd argument - format
    const dateObjectStart = dateStart.toDate(); // convert moment.js object to Date object

    const dateEnd = moment(date_end, "DD-MM-yyyy"); // 1st argument - string, 2nd argument - format
    const dateObjectEnd = dateEnd.toDate(); // convert moment.js object to Date object

    const dates = Between(
      dateObjectStart.toISOString(),
      dateObjectEnd.toISOString()
    );

    if (module === "REGISTERS") {
      return this._bitacoraRepo.find({
        where: {
          module: "USERS",
          event_id: 5,
          created_at: dates,
        },
        relations: this._relations,
      });
    }
    if (module === "LOGINS") {
      return this._bitacoraRepo.find({
        where: {
          module: "USER",
          event_id: 6,
          created_at: dates,
        },
        relations: this._relations,
      });
    }
    if (module === "POSTS") {
      return this._bitacoraRepo.find({
        where: {
          event_id: 1,
          module: "POSTS",
          created_at: dates,
        },
        relations: this._relations,
      });
    }
    if (module === "COMMENTS") {
      return this._bitacoraRepo.find({
        where: {
          event_id: 1,
          module: "COMMENTS",
          created_at: dates,
        },
        relations: this._relations,
      });
    }
  }
}
