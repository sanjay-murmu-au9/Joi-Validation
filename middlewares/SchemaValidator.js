const _ = require('lodash');
const Joi = require('joi');
const Schemas = require('../schemas');

module.exports = (useJoiError = false) => {
    // useJoiError determines if we should response with the base Joi error
    // boolean default to false
    const _useJoiError = _.isBoolean(useJoiError) && useJoiError;

    // enable HTTP methods for reuest data validation
    const _supportedMethods = ['post', 'put'];

    // Joi validation options
    const _validationOptions = {
        abortEarly: false, // abort after the last validation error
        allowUnknown: true, //allow unknown keys that will be ignore
        stripUnknown: true // remove unknown keys from the validated data
    };

    // return the validation middleware
    return (req, res, next) => {
        
        const route = req.route.path;
        const method = req.method.toLowerCase();

        if (_.includes(_supportedMethods, method) && _.has(Schemas, route)) {
            // get schema for the current route
            const _schema = _.get(Schemas, route);

            if (_schema) {
                // validate req.body using the schema and validation options
                return Joi.validate(req.body, _schema, _validationOptions, (err, data) => {

                    if (err) {
                        // joi Error
                        const JoiError = {
                            status: 'failed',
                            error: {
                                original: err._object,

                                // fetch only message and type from each error
                                details: _.map(err.details, ({ message, type }) => ({
                                    message: message.replace(/['"]/g, ''),
                                    type
                                }))
                            }
                        };

                        // custom Error
                        const CustomError = {
                            status: 'failed',
                            error: 'Invalid request data. Please review request and try again.'
                        };

                        // send back the JSON error response
                        res.status(422).json(_useJoiError ? JoiError : CustomError);

                    } else {
                        // Replace req.body with the data Joi validation
                        req.body = data;
                        next();
                    }

                });
            }
        }
        next();
    };
};