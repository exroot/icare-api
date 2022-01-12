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
import { Profile } from "../entity/Profile";

type OrderBy = "ASC" | "DESC" | 1 | -1;

export class BitacoraService {
  protected _bitacoraRepo: Repository<EventLog>;
  protected _postsRepo: Repository<Post>;
  protected _commentsRepo: Repository<Comment>;
  protected _usersRepo: Repository<User>;
  protected _profilerepo: Repository<Profile>;
  protected _relations: string[];

  constructor() {
    this._bitacoraRepo = getRepository(EventLog);
    this._relations = ["event", "user", "user.profile", "user.role"];
    this._postsRepo = getRepository(Post);
    this._commentsRepo = getRepository(Comment);
    this._usersRepo = getRepository(User);
    this._profilerepo = getRepository(Profile);
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
    console.log("insideee: ", q);
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
          event: {
            event: identifier,
          },
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
    console.log("args: ", args);
    return this._bitacoraRepo.find({ ...args, relations: this._relations });
  }

  async getReport(
    module: string,
    date_start: string,
    date_end: string,
    identifier: string,
    special: string
  ) {
    let dateStart, dateObjectStart, dateEnd, dateObjectEnd, dates;
    if (date_start && date_end) {
      dateStart = moment(date_start, "DD-MM-yyyy"); // 1st argument - string, 2nd argument - format
      dateObjectStart = dateStart.toDate(); // convert moment.js object to Date object

      dateEnd = moment(date_end, "DD-MM-yyyy"); // 1st argument - string, 2nd argument - format
      dateObjectEnd = dateEnd.toDate(); // convert moment.js object to Date object

      dates = Between(
        dateObjectStart.toISOString(),
        dateObjectEnd.toISOString()
      );
    }

    if (special) {
      const records = await this._profilerepo.find({
        order: {
          follower_count: "DESC",
        },
        take: 100,
        relations: ["user", "user.role"],
      });
      const mappedRecords = records.map((record) => {
        return {
          user_id: record.user_id,
          email: record.user.email,
          username: record.username,
          nombre: record.first_name,
          apellido: record.last_name,
          seguidores: record.follower_count,
          timestamp: record.user.created_at,
        };
      });
      return mappedRecords;
    }

    if (identifier && module === "POSTS") {
      const records = await this._postsRepo.find({
        where: {
          user_id: identifier,
        },
        relations: ["user", "user.profile", "comments"],
      });

      const mappedRecords = records.map((record) => {
        return {
          post_id: record.id,
          titulo: record.title,
          email: record.user.email,
          comentarios: record.comments.length,
          timestamp: record.created_at,
        };
      });
      return mappedRecords;
    }

    if (identifier && module === "COMENTARIOS") {
      const records = await this._commentsRepo.find({
        where: {
          user_id: identifier,
        },
        relations: ["user", "user.profile"],
      });
      const mappedRecords = records.map((record) => {
        return {
          commentario_id: record.id,
          email: record.user.email,
          username: record.user.profile.username,
          timestamp: record.created_at,
        };
      });
      return mappedRecords;
    }

    if (module === "USUARIOS") {
      const records = await this._bitacoraRepo.find({
        where: {
          module: "USER",
          event_id: 5,
          created_at: dates,
        },
        relations: this._relations,
      });
      const mappedRecords = records.map((record) => {
        return {
          usuario_id: record.user.id,
          evento: record.event.event,
          email: record.user.email,
          username: record.user.profile.username,
          timestamp: record.created_at,
        };
      });
      return mappedRecords;
    }
    if (module === "POSTS") {
      const records = await this._postsRepo.find({
        where: {
          created_at: dates,
        },
        relations: ["user", "user.profile"],
      });
      const mappedRecords = records.map((record) => {
        return {
          post_id: record.id,
          titulo: record.title,
          usuario_id: record.user_id,
          email: record.user.email,
          username: record.user.profile.username,
          timestamp: record.created_at,
        };
      });
      return mappedRecords;
    }
    if (module === "COMENTARIOS") {
      const records = await this._commentsRepo.find({
        where: {
          created_at: dates,
        },
        relations: ["user", "user.profile"],
      });
      const mappedRecords = records.map((record) => {
        return {
          comentario_id: record.id,
          usuario_id: record.user_id,
          email: record.user.email,
          username: record.user.profile.username,
          timestamp: record.created_at,
        };
      });
      return mappedRecords;
    }
  }
}
