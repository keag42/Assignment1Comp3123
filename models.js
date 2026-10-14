const mongoose= require('mongoose');
const Joi = require('joi')

const UserSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }, //TODO apperantly moongose makes this automatically so check that out
    username: {type: String, unique:true},
    email: {type:String, unique:true},
    password: {type: String},
    created_at: {type:Date},
    updated_at: {type:Date}
});
//JOI is for validation not in the Schema
//email: Joi.string().email(),
//     password: Joi.string().alphanum().min(7).max(20).required(),
const EmployeeSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    first_name: {type:String},
    last_name: {type:String},
    email: {type:String},
    position: {type:String},
    salary: {type:Number},
    date_of_joining: {type:Date},
    department: {type:String},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {type:Date},
    updated_at: {type:Date}
})

// Create models
const User = mongoose.model('User', UserSchema);
const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = { User, Employee };