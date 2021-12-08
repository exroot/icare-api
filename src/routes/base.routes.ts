import { Router } from "express";
import { login, register, mySession } from "../controllers/auth.controller";
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
  unfollowUser,
  updateProfile,
} from "../controllers/profile.controller";
import { authenticated } from "../middleware/auth.middleware";
import { paginationHandler } from "../middleware/pagination.middleware";

const router = Router();

/* Cron */
router.get("/cronjobs", cronjobs);

/* Auth */
router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticated, mySession);

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
router.get("/profiles/:id", getProfile);
router.post("/profiles", authenticated, createProfile);
router.put("/profiles/:id", authenticated, updateProfile);
router.post("/users/:id/following", authenticated, followUser);
router.delete("/users/:id/following", authenticated, unfollowUser);

/* Feed */
router.get("/feed", authenticated, paginationHandler, getFeedPosts);

export default router;
