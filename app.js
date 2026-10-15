const express = require('express');
const mongoose= require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Loads the variables
const { User, Employee } = require('./models'); //this adds the models
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT
const jwtSecret =process.env.JWT_SECRET;

//middleware
app.use(express.json());



console.log("starting mongoose.connect")
//connecting to db
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Connected to MongoDB');

        // Start server only after connection succeeds
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

//GET Template
app.get("/api/status",(req, res) =>{
    res.json({
        val1: "safa"
    })
})

//USER API
const usrPath ="/api/v1/user"

app.post(`${usrPath}/signup`, async (req, res)=>{
    const {username, password, email} = req.body
    console.log(`${usrPath}/signup Called`)
    //VALIDATION -----
        //check if all data is provided
    if(!username)  return res.status(400).json({error:"Username not given"})
    if(!password)  return res.status(400).json({error:"Password not given"})
    if(!email)  return res.status(400).json({error:"Email not given"})

        //Make sure password satisfies basic requirements
    if(password.length < 8) return res.status(400).json({error:"Password must be atleast 8 charactors"})
    const passwordHasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{2,}$/;
    if(!passwordHasLettersAndNumbers.test(password))return res.status(400).json({error:"Password have letters and numbers"})


    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        //Create user
        const newID = new mongoose.Types.ObjectId();
        const newUser = await User.create({
            _id: newID,
            username: username,
            password: hashedPassword,
            email: email,
            createdAt: Date.now(),
            updatedAt: Date.now()
        })

        console.log(`new user created:  '${newUser._id}'`)
        res.status(201).json({
            message: "New User Created",
            user: newUser
        })
    }
    catch(err){
        console.log("Error creating user")
        console.log(err)
    }
})
app.post(`${usrPath}/login`, async (req, res)=> {
    console.log(`${usrPath}/login Called`)
    const {username, password, email} = req.body
    if(!password)  return res.status(400).json({error:"Password not given"})
    if(!email && !username)  return res.status(400).json({error:"Email and Password were not given, you must provide one"})

    const query = username ? { username } : { email };
    const foundUser = await User.findOne(query);
    if (!foundUser) {
        return res.status(400).json({error: "User Not Found"});
    }

    //check password
    const passCorrect = await bcrypt.compare(password, foundUser.password);
    if(!passCorrect){
        return res.status(400).json({error: "Invalid credentials"});
    }

    const payload = {
        userId: foundUser._id,
        username: foundUser.username,
        email: foundUser.email
    }
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );
    return res.status(200).json({
        message: "Login successful",
        token: token
    });

})

//TODO REMOVE this is temporary for testing
app.get(`${usrPath}/getUsers`, async (req, res)=> {
    try {
        // Find all documents in the User collection
        const users = await User.find({});


        return res.status(200).json({users});

    } catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Internal server error" });
    }

})


//verifying token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Not signed in / No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attaches { userId, username, ... } to the request
        next(); // User is verified, proceed to the route handler
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};


//Employee API
const employeePath ="/api/v1/emp"

app.get(`${employeePath}/employees`,verifyToken, async (req, res)=>{
   console.log(`${employeePath}/employees GET Called`)

    const emps = await Employee.find({user: req.user.userId})
    if(!emps){
        return res.status(400).json({ error: "No Employees" });
    }
    return res.status(200).json({ emps });
})

app.post(`${employeePath}/employees`,verifyToken, async (req, res)=>{
    console.log(`${employeePath}/employees POST Called`)
    const {first_name, last_name, email, position, salary, date_of_joining, department} = req.body

    if(!first_name)  return res.status(400).json({error:"First name not given"})
    if(!last_name)  return res.status(400).json({error:"Last name not given"})
    if(!email)  return res.status(400).json({error:"Email not given"})
    if(!position)  return res.status(400).json({error:"Position not given"})
    if(!salary)  return res.status(400).json({error:"Salary not given"})
    if(!date_of_joining)  return res.status(400).json({error:"Date of joining not given"})
    if(!department)  return res.status(400).json({error:"Department of joining not given"})

    const ownerId = new mongoose.Types.ObjectId(req.user?.userId);
    console.log(`ID: ${ownerId}`)
    //TODO add check if employee already exists
    if (!ownerId) {
        return res.status(401).json({ error: "Unauthorized: User information missing" });
    }

    const newID = new mongoose.Types.ObjectId();
    const newEmployee = await Employee.create({
        _id: newID,
        first_name: first_name,
        last_name: last_name,
        email: email,
        position: position,
        salary: salary,
        date_of_joining: date_of_joining,
        department: department,
        user: ownerId, //Refer to User
        createdAt: Date.now(),
        updatedAt: Date.now()
    })

    return res.status(201).json({ emps });
})

app.get(`${employeePath}/employees/:eid`, verifyToken, async (req, res) => {
    console.log(`${employeePath}/employees POST Called`)
    const {eid} = req.params

    if (!eid) {
        return res.status(401).json({ error: "Unauthorized: Employee ID missing" });
    }

    const empId = new mongoose.Types.ObjectId(eid);

    const employee = await Employee.findOne({
        _id: empId,
        user: req.user.userId
    })
    console.log(`ID: ${eid}`)


    return res.status(201).json(employee);
})

app.put(`${employeePath}/employees/:eid`, verifyToken, async (req, res) => {
    console.log(`${employeePath}/employees PUT Called`)
    const {eid} = req.params

    if (!eid) {
        return res.status(401).json({ error: "Unauthorized: Employee ID missing" });
    }
    const {first_name, last_name, email, position, salary, date_of_joining, department} = req.body

    if(!first_name)  return res.status(400).json({error:"First name not given"})
    if(!last_name)  return res.status(400).json({error:"Last name not given"})
    if(!email)  return res.status(400).json({error:"Email not given"})
    if(!position)  return res.status(400).json({error:"Position not given"})
    if(!salary)  return res.status(400).json({error:"Salary not given"})
    if(!date_of_joining)  return res.status(400).json({error:"Date of joining not given"})
    if(!department)  return res.status(400).json({error:"Department of joining not given"})

    const ownerId = new mongoose.Types.ObjectId(req.user?.userId);
    console.log(`ID: ${ownerId}`)

    const empId = new mongoose.Types.ObjectId(eid);


    console.log(`ID: ${eid}`)

    await Employee.updateOne(
        // 1. The Filter (Find the document by ID and owner)
        {
            _id: new mongoose.Types.ObjectId(eid),
            user: ownerId
        },
        // 2. The Update (Use $set to specify the fields to update)
        {
            $set: {
                first_name: first_name,
                last_name: last_name,
                email: email,
                position: position,
                salary: salary,
                date_of_joining: date_of_joining,
                department: department,
                updatedAt: Date.now() // Only update the timestamp
            }
        }
    );

    return res.status(201).json({});
})
