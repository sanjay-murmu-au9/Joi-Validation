const Joi = require('joi');
const name = Joi.string().regex(/^[A-Z]+$/).uppercase();

//accepts a valid UUID v4 string as id
const personID = Joi.string().guid({ version: 'uuidv4' });


//accept age greater then 6
// value could be in one of these forms: 15,'15','15y','15yrs'
// all string ages will be replaced to strip off non-digits
const ageSchema = Joi.alternatives().try([
    Joi.number().integer().greater(6).required(),
    Joi.string().replace(/^([7-9]|[1-9]\d+)(y|yr|yrs)?$/i, '$1').required(),
]);

const personDataSchema = Joi.object().keys({
    id: personID.required(),
    firstname: name,
    lastname: name,
    fullname: Joi.string().regex(/^[A-Z]+[A-Z]+$/i).uppercase(),
    type: Joi.string().valid('STUDENT', 'TEACHER').uppercase().required(),
    sex: Joi.string().valid(['M', 'F', 'MALE', 'FEMALE']).uppercase().required(),

    // if type is STUDENT, then age is required
    age: Joi.when('type', {
        is: 'STUDENT',
        then: ageSchema.required(),
        otherwise: ageSchema
    })
})

    // must have only one between firstname and lastname
    .xor('firstname', 'fullname')

    // firstname and lastname must always apper toghter
    .and('firstname', 'lastname')

    // firstname and  lastname must always appera togehter with fullname
    .without('fullname', ['firstname', 'lastname']);

// password and confirmPassword must contain the same value

const authDataSchema = Joi.object({
    teacherId: personID.required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(7).required(),
    consfirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
});

// cardNumber must be a valid Luhn number
const feedDataSchema = Joi.object({
    studentId: personID.required(),
    amount: Joi.number().positive().greater(1).precision(2).required(),
    cardNumber: Joi.string().creditCard().required(),
    completedAt: Joi.date().timestamp().required()
});

//export the schemas
module.exports = {
    '/people': personDataSchema,
    '/auth/edit': authDataSchema,
    '/fees/pay': feedDataSchema
};

