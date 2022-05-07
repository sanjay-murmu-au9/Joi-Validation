const express = require('express');
const router = express.Router();
const SchemaValidator = require('./middlewares/SchemaValidator');

// We are using the formatted Joi validation error
// Pass false as argument to use a generic error
const validateRequest = SchemaValidator(true)

// generic route handler
const genericHandler = (req, res, next) => {
    res.json({
        status: 'success',
        data: req.body
    });
};

// create a new teacher or student
router.post('/people', validateRequest, genericHandler);

// change auth credentials for the teachers
router.post('/auth/edit', validateRequest, genericHandler);

// accept fee payments for the students

router.post('/auth/pay', validateRequest, genericHandler);

module.exports = router;








