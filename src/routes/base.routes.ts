import { Router } from "express";
import { getRecords, getReports } from "../controllers/admin.controller";
import {
  login,
  register,
  mySession,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  searchCategories,
  updateCategory,
} from "../controllers/categories.controller";
import {
  createComment,
  deleteComment,
  getComments,
  getCommentsByPost,
  updateComment,
} from "../controllers/comments.controller";
import { cronjobs } from "../controllers/cronjobs.controller";
import {
  createPost,
  deletePost,
  getFeedPosts,
  getPostById,
  getPosts,
  searchPosts,
  updatePost,
} from "../controllers/posts.controller";
import {
  createProfile,
  followUser,
  getProfile,
  getProfiles,
  getSuggestedProfiles,
  searchProfiles,
  unfollowUser,
  updateProfile,
  updateProfileImage,
} from "../controllers/profile.controller";
import { authenticated } from "../middleware/auth.middleware";
import { paginationHandler } from "../middleware/pagination.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../../static/images");
  },
  filename: function (req, file, cb) {
    // const path = __dirname + "/../../static/images";
    const prefix = `${req.body.username}_${req.body.imagetype}`;
    // fs.readdir(path, (err, files) => {
    //   if (!files) {
    //     return;
    //   }
    //   const newRegex = new RegExp("^" + prefix);
    //   for (let i = 0, len = files.length; i < len; i++) {
    //     const match = files[i].match(newRegex);
    //     console.log("file: ", files[i]);
    //     console.log("regex: ", newRegex);
    //     if (match !== null)
    //       fs.unlink(path + "/" + files[i], (err) => {
    //         if (err) console.log(err);
    //         else {
    //           console.log(`\nDeleted file: ${match[0]}`);
    //         }
    //       });
    //   }
    // });
    cb(null, `${prefix}_${Date.now()}.jpg`); //Appending .jpg
  },
});

const upload = multer({
  dest: __dirname + "/../../static/images",
  storage: storage,
});

// const upload = multer({ dest: __dirname + "/../../static/images" });

const router = Router();

/* Cron */
router.get("/cronjobs", cronjobs);

/* Auth */
router.post("/auth/login", login);
router.post("/auth/register", register);
router.get("/auth/user", authenticated, mySession);
router.post("/auth/token/refresh", refreshToken);
router.post("/auth/logout", authenticated, logout);

/* Post */
router.get("/posts", paginationHandler, getPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", authenticated, createPost);
router.put("/posts/:id", authenticated, updatePost);
router.delete("/posts/:id", authenticated, deletePost);
router.get("/posts/search", searchPosts);

/* Comments */
router.get("/comments-all", authenticated, paginationHandler, getComments);
router.get("/comments", paginationHandler, getCommentsByPost);
router.post("/comments", authenticated, createComment);
router.put("/comments/:id", authenticated, updateComment);
router.delete("/comments/:id", authenticated, deleteComment);

/* Categories */
router.get("/categories", authenticated, paginationHandler, getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", authenticated, createCategory);
router.put("/categories/:id", authenticated, updateCategory);
router.delete("/categories/:id", authenticated, deleteCategory);
router.get("/categories/search", authenticated, searchCategories);

/* Profiles */
router.get("/profiles", authenticated, paginationHandler, getProfiles);
router.post("/profiles", authenticated, createProfile);
router.get("/profiles/suggested", authenticated, getSuggestedProfiles);
router.get("/profiles/search", searchProfiles);
router.get("/profiles/:username", getProfile);
router.put("/profiles/:username", authenticated, updateProfile);
router.post(
  "/profiles/:username",
  authenticated,
  upload.single("image"),
  updateProfileImage
);
router.post("/profiles/:username/following", authenticated, followUser);
router.delete("/profiles/:username/following", authenticated, unfollowUser);

/* Bitacora */
router.get("/bitacora", paginationHandler, getRecords);
router.get("/bitacora/reports", getReports);

/* Feed */
router.get("/feed", authenticated, paginationHandler, getFeedPosts);

export default router;
