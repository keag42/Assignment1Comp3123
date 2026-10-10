const express = require('express');
const app = express();
const PORT = 3000
const mongoose= require('mongoose');


//middleware
app.use(express.json());

//GET Template
app.get("/api/status",(req, res) =>{
    res.json({
        val1: "safa"
    })
})

//USER API
const usrPath ="/api/v1/user"

app.post(`${usrPath}/signup`, (req, res)=>{
    const {user, pass, email} = req.body

    //do some validation
    if(!user){
        return res.status(400).json({error:"user not given"})
    }

    //Create user
    const newID = new mongoose.Types.ObjectId();
    const newUser = {
        _id: newID,
        username: user,
        password: pass,
        email: email,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }

    users.push(newUser);//TODO replace this with actual database

    res.status(201).json({
        message: "New User Created",
        user: newUser
    })
})

//Employee API
const employeePath ="/api/v1/emp"

//start server
app.listen(PORT, ()=>{
    console.log(`server running on https//localhost:${PORT}`);
});