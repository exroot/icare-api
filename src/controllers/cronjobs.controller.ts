import { NextFunction, Request, Response } from "express";
import { CronjobService } from "../services/cronjobs.service";

export const cronjobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cronjobsService = new CronjobService();
    const rolesGeneration = await cronjobsService.createRoles();
    const permissionGeneration = await cronjobsService.createPermissions();
    const eventsGeneration = await cronjobsService.createEvents();
    const relationsGeneration = await cronjobsService.createRelations();
    const categoriesGeneration = await cronjobsService.createCategories();
    const adminAccountGeneration = await cronjobsService.createAdmin();
    const usersAndProfilesGeneration =
      await cronjobsService.createUsersAndProfiles();
    const postsGeneration = await cronjobsService.createPosts();
    if (
      rolesGeneration &&
      permissionGeneration &&
      eventsGeneration &&
      relationsGeneration &&
      categoriesGeneration &&
      adminAccountGeneration &&
      usersAndProfilesGeneration &&
      postsGeneration
    ) {
      return res.status(200).json({
        status: 200,
        code: "Success",
        message: "Cronjobs exitosos",
      });
    }
    return res.status(400).json({
      status: 400,
      code: "Bad request",
      message: "Cronjobs fallaron",
    });
  } catch (err) {
    console.log("ERROR at cronjobs: ", err);
    next(err);
  }
};
