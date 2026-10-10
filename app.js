import {MongoClient, ObjectId} from 'mongodb';
const mongoose= require('mongoose');
// Replace with your local URI (mongodb://localhost:27017) or your MongoDB Atlas cloud URI
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

//Creating Schemas

const UserModel = new mongoose.Schema({
    _id: {type: ObjectId, required:true},
    username: {type: String, unique:true},
    password: {type: String}, //TODO password validation & hashing]==
    created_at: {type:Date},
    updated_at: {type:Date}
});

const EmployeeModel = new mongoose.Schema({
    _id: {type: ObjectId, required:true},
    first_name: {type:String},
    last_name: {type:String},
    email: {type:String},
    position: {type:String},
    salary: {type:Number},
    date_of_joining: {type:Date},
    department: {type:String},
    user: {type:ObjectId},
    created_at: {type:Date},
    updated_at: {type:Date}
})

//Connecting to server
async function run() {
    try {
        // Connect to the server
        await client.connect();
        console.log("Connected successfully to MongoDB");
        // Specify the database and collection names
        const database = client.db('my_store');
        const products = database.collection('products');
        // Executing database operations goes here...
    } catch (error) {
        console.error("An error occurred:", error);
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);