const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const workoutSchema = Joi.object({
  type: Joi.string().valid('pushup', 'squat', 'plank', 'walk').required(),
  amount: Joi.number().integer().min(1).max(10000).required()
});

const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const battleActionSchema = Joi.object({
  dungeonId: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  workoutSchema,
  locationSchema,
  battleActionSchema
};