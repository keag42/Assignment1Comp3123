const mongoose= require('mongoose');


const UserSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    username: {type: String, unique:true},
    password: {type: String, minLength:8}, //TODO password validation & hashing]==
    created_at: {type:Date},
    updated_at: {type:Date}
});

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