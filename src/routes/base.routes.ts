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
  getPostById,
  getPosts,
  searchPosts,
  updatePost,
} from "../controllers/posts.controller";

const router = Router();

/* Cron */
router.get("/cronjobs", cronjobs);

/* Auth */
router.post("/login", login);
router.post("/register", register);
router.get("/me", mySession);

/* Post */
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", createPost);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);
router.get("/posts/search", searchPosts);

/* Comments */
router.get("/comments-all", getComments);
router.get("/comments", getCommentsByPost);
router.post("/comments", createComment);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

/* Categories */
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.get("/categories/search", searchCategories);

export default router;
