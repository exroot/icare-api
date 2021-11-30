import Joi from "joi";

export const commentSchema = Joi.object({
  body: Joi.string().min(1).max(150).required(),
  post_id: Joi.string().alphanum().required(),
  user_id: Joi.string().alphanum().required(),
});
