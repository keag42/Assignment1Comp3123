const Joi = require('joi');
const {writeLog} = require('./util/logger');

const loginSchema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).required()
}).or('username', 'email');

const loginValidation = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        writeLog("warn", `Validation failed (${error.details[0].type})`, req);
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    next();
};

const signUpSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
        .required()
});

const signUpValidation = (req, res, next) => {
    const { error } = signUpSchema.validate(req.body);
    if (error) {
        writeLog("warn", `Validation failed (${error.details[0].type})`, req);
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    next();
};

const employeeSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    position: Joi.string().required(),
    salary: Joi.number().required(),
    date_of_joining: Joi.date().required(),
    department: Joi.string().required()
});

const employeeIdValidation = (req, res, next) => {
    const schema = Joi.object({
        eid: Joi.string().hex().length(24).required()
    });

    const data = req.method === "DELETE" ? req.query : req.params;

    const { error } = schema.validate(data);

    if (error) {
        writeLog("warn", `Validation failed (${error.details[0].type})`, req);
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};

const employeeValidation = (req, res, next) => {
    const { error } = employeeSchema.validate(req.body);

    if (error) {
        writeLog("warn", `Validation failed (${error.details[0].type})`, req);
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    next();
};
const deleteEmployeeValidation = (req, res, next) => {
    const schema = Joi.object({
        eid: Joi.string().hex().length(24).required()
    });

    const { error } = schema.validate(req.query);

    if (error) {
        writeLog("warn", `Validation failed (${error.details[0].type})`, req);
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    next();
};
module.exports = { signUpValidation, loginValidation, employeeValidation, employeeIdValidation, deleteEmployeeValidation };
