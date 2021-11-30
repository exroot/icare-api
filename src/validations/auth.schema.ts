import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().min(1).max(150).required(),
  password: Joi.string().min(8).max(32).required(),
});

export const registroSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().alphanum().min(8).max(32).required(),
});
