import Joi from "joi";

export const profileSchema = Joi.object({
  username: Joi.string().alphanum().min(1).max(150).required(),
  firstname: Joi.string().alphanum().min(1).max(150),
  lastname: Joi.string().alphanum().min(1).max(150),
});
