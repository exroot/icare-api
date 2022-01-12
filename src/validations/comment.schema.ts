import Joi from "joi";

export const commentSchema = Joi.object({
  body: Joi.string().min(1).max(150).required(),
  post_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
});
