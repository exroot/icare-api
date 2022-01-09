import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { EventLog } from "../entity/EventLog";
import { Post } from "../entity/Post";
import { BitacoraService } from "../services/bitacora.service";
import { PostService } from "../services/post.service";
import { postSchema } from "../validations/post.schema";

const MESSAGES = {
  GET: {
    SUCCESS: "Registro encontrado exitosamente.",
  },
  GET_MANY: {
    SUCCESS: "Registros encontrados exitosamente.",
  },
  POST: {
    SUCCESS: "Registro creado exitosamente.",
    ERROR: "Error creando el Registro.",
  },
  UPDATE: {
    SUCCESS: "Registro actualizado exitosamente.",
    ERROR: "Error actualizando el Registro.",
  },
  DELETE: {
    SUCCESS: "Registro eliminado exitosamente.",
  },
};

export const getRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    page,
    limit,
    orderBy,
    sortBy,
    q,
    identifier,
    show_meta,
    date_start,
    date_end,
  } = req.query;
  console.log("identifier: ", identifier as string);
  try {
    const bitacoraService = new BitacoraService();
    const bitacoraRecords = await bitacoraService.getMany(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string,
      q as string,
      identifier as string,
      date_start as string,
      date_end as string
    );

    if (!bitacoraRecords) {
      return res.status(200).json({
        status: 200,
        code: "Successful",
        message: MESSAGES.GET_MANY.SUCCESS,
        data: [],
      });
    }
    if (show_meta) {
      return res.status(200).json(bitacoraRecords);
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET_MANY.SUCCESS,
      data: bitacoraRecords,
    });
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

// export const getRecordsFiltered = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     page,
//     limit,
//     orderBy,
//     sortBy,
//     q,
//     identifier,
//     show_meta,
//     date_start,
//     date_end,
//   } = req.body;

//   try {
//     const bitacoraService = new BitacoraService();
//     const bitacoraRecords = await bitacoraService.getMany(
//       parseInt(page as string),
//       parseInt(limit as string),
//       sortBy as string,
//       orderBy as string,
//       q as string,
//       identifier as string
//     );

//     if (!bitacoraRecords) {
//       return res.status(200).json({
//         status: 200,
//         code: "Successful",
//         message: MESSAGES.GET_MANY.SUCCESS,
//         data: [],
//       });
//     }
//     if (show_meta) {
//       return res.status(200).json(bitacoraRecords);
//     }
//     return res.status(200).json({
//       status: 200,
//       code: "Successful",
//       message: MESSAGES.GET_MANY.SUCCESS,
//       data: bitacoraRecords,
//     });
//   } catch (err) {
//     console.log("error: ", err);
//     throw err;
//   }
// };
