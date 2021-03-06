import { NextFunction, Request, Response } from "express";

export const paginationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const availableOrders = ["ASC", "DESC"];
    let order = req.query.orderBy as string;
    let sort = req.query.sortBy as string;
    let page = req.query.page;
    let limit = req.query.limit;
    if (!limit) {
      limit = "10";
    }
    if (!page) {
      page = "1";
    }
    if (!sort) {
      sort = "id";
    }
    if (!order || !availableOrders.includes(order.toUpperCase())) {
      order = "DESC";
    }
    req.query.sortBy = sort;
    req.query.orderBy = order.toUpperCase();
    req.query.limit = limit;
    req.query.page = page;
    next();
  } catch (err) {
    console.log("ERROR at paginationHandler middleware.");
    throw err;
  }
};
