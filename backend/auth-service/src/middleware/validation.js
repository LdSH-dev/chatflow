const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(20).required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, underscores and hyphens',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be less than 20 characters'
    }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * Validate request body against schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    next();
  };
}

module.exports = {
  validateRegister: validateBody(registerSchema),
  validateLogin: validateBody(loginSchema)
};