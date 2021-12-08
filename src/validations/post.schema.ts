import Joi from "joi";

export const postSchema = Joi.object({
  title: Joi.string().min(1).max(150).required(),
  body: Joi.string().min(1).max(150).required(),
  user_id: Joi.number().integer().required(),
});
