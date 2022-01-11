import Joi from "joi";

export const profileSchema = Joi.object({
  username: Joi.string().min(1).max(150).required(),
  first_name: Joi.string().max(150),
  last_name: Joi.string().max(150),
  bio: Joi.string().max(150),
  location_city: Joi.string().max(150),
  location_country: Joi.string().max(150),
  website: Joi.string().max(150),
  // image_avatar: Joi.string().max(150),
  // image_cover: Joi.string().max(150),
});
