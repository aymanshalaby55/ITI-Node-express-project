const Joi = require('joi');

const donateBodySchema = Joi.object({
    amount: Joi.number().min(5).required(),
}).required();


const donationSchema = {
  body: donateBodySchema,
}

module.exports = donationSchema;