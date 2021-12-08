import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Post } from "../entity/Post";
import { Profile } from "../entity/Profile";
import { User } from "../entity/User";
import { ProfileService } from "../services/profile.service";
import { postSchema } from "../validations/post.schema";
import { profileSchema } from "../validations/profile.schema";

const MESSAGES = {
  GET: {
    SUCCESS: "Perfil encontrado exitosamente.",
  },
  GET_MANY: {
    SUCCESS: "Perfil encontrados exitosamente.",
  },
  POST: {
    SUCCESS: "Perfil creado exitosamente.",
    ERROR: "Error creando el Perfil.",
  },
  UPDATE: {
    SUCCESS: "Perfil actualizado exitosamente.",
    ERROR: "Error actualizando el Perfil.",
  },
  DELETE: {
    SUCCESS: "Perfil eliminado exitosamente.",
  },
  FOLLOW: {
    SUCCESS: "Ahora sigues a este usuario.",
    ERROR: "Problema al tratar de seguir al usuario.",
  },
  UNFOLLOW: {
    SUCCESS: "Dejaste de seguir a este usuario.",
    ERROR: "Problemas al tratar de dejar de seguir al usuario.",
  },
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profile = await profileService.get(parseInt(id));
    if (!profile) {
      return res.status(200).json({
        status: 200,
        code: "Successful",
        message: MESSAGES.GET.SUCCESS,
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET.SUCCESS,
      data: profile,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const getProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, orderBy, sortBy } = req.query;
  try {
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profiles = await profileService.getMany(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy as string,
      orderBy as string
    );
    if (!profiles) {
      return res.status(200).json({
        status: 200,
        code: "Successful",
        message: MESSAGES.GET_MANY.SUCCESS,
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET_MANY.SUCCESS,
      data: profiles,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const getProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profile = await profileService.get(parseInt(id));
    if (!profile) {
      return res.status(404).json({
        status: 404,
        code: "Not found",
        message: "Perfil no encontrado",
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET.SUCCESS,
      data: profile,
    });
  } catch (err) {
    console.log("ERROR:", err);
    next(err);
  }
};

export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    // Validation
    const { error } = profileSchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profile = await profileService.create(body);
    if (!profile) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.POST.ERROR,
      });
    }
    return res.status(201).json({
      status: 201,
      code: "Successful",
      message: MESSAGES.POST.SUCCESS,
      data: profile,
    });
  } catch (err) {
    console.log("ERROR:", err);
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { id } = req.params;
  try {
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profileExists = await profileService.existe(parseInt(id));
    if (!profileExists) {
      return res.status(404).json({
        code: "Not found",
        message: "Perfil no encontrado.",
        status: 404,
      });
    }
    // Validation
    const { error } = postSchema.validate(body);
    if (error) {
      return res.status(400).json({
        code: "Bad request",
        message: error,
        status: 400,
      });
    }

    const profile = await profileService.update(parseInt(id), body);
    if (!profile) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.UPDATE.ERROR,
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.UPDATE.SUCCESS,
      data: profile,
    });
  } catch (err) {
    console.log("ERROR:", err);
    next(err);
  }
};

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { user } = req;
  try {
    const userRepo = getRepository(User);
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const userToFollow = await userRepo.findOne(parseInt(id));

    if (!userToFollow) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: "No puedes seguir a este usuario.",
      });
    }

    const followOk = await profileService.follow(
      parseInt(user.id),
      userToFollow.id
    );
    if (!followOk) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.FOLLOW.ERROR,
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.FOLLOW.SUCCESS,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  console.log("ID: ", id);
  const { user } = req;
  try {
    const userRepo = getRepository(User);
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const userToFollow = await userRepo.findOne(parseInt(id));

    if (!userToFollow) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: "No puedes dejar seguir a este usuario.",
      });
    }

    const isFollowing = await profileService.isFollowing(
      parseInt(user.id),
      userToFollow.id
    );
    if (!isFollowing) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: "No sigues a este usuario.",
      });
    }
    const unfollowOk = await profileService.unfollow(
      parseInt(user.id),
      userToFollow.id
    );
    if (!unfollowOk) {
      return res.status(400).json({
        status: 400,
        code: "Bad request",
        message: MESSAGES.UNFOLLOW.ERROR,
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.UNFOLLOW.SUCCESS,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};

export const searchPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { q } = req.query;
  try {
    const profileRepo = getRepository(Profile);
    const profileService = new ProfileService(profileRepo);
    const profiles = await profileService.search(q as string);
    if (!profiles) {
      return res.status(200).json({
        status: 200,
        code: "Successful",
        message: MESSAGES.GET_MANY.SUCCESS,
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      code: "Successful",
      message: MESSAGES.GET_MANY.SUCCESS,
      data: profiles,
    });
  } catch (err) {
    console.log("ERROR: ", err);
    next(err);
  }
};
