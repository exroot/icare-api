import Joi from "joi";

export const categorySchema = Joi.object({
  category: Joi.string().min(1).max(150).required(),
});
