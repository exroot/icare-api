import { getRepository, Repository, Between } from "typeorm";
import { startOfDay, endOfDay } from "date-fns";
import { IPermission } from "../types/interfaces";
import jwt from "jsonwebtoken";
import { EventLog } from "../entity/EventLog";
import { addYears, subYears } from "date-fns";
import moment from "moment";

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

      // const [day_start, month_start, year_start] = date_start.split("/");
      // const [day_end, month_end, year_end] = date_start.split("/");
      // const startDate = new Date(
      //   +year_start,
      //   parseInt(month_start) - 1,
      //   +day_start
      // );
      // const endDate = new Date(+year_end, parseInt(month_end) - 1, +day_end);

      const dates = Between(
        dateObjectStart.toISOString(),
        dateObjectEnd.toISOString()
      );

      console.log("DADA ISO: ", dateObjectStart);
      console.log("PUPU ISO: ", dateObjectEnd);
      console.log("BETWEEN: ", dates);
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
}
