const {User} = require('../models.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose= require('mongoose');
const { writeLog } = require('../util/logger.js');

const login = async (req, res) => {
    writeLog("info", "Login Called");

    const { username, email, password } = req.body;

    try {
        const query = username ? { username } : { email };
        const foundUser = await User.findOne(query);

        if (!foundUser) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passCorrect = await bcrypt.compare(password, foundUser.password);

        if (!passCorrect) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const payload = {
            userId: foundUser._id,
            username: foundUser.username,
            email: foundUser.email
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        writeLog("info", "Login Success");

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (err) {
        writeLog("Error", `Login failed: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
const signup = async (req, res) => {
    const { username, password, email } = req.body;
    writeLog("info", "/api/v1/user/signup Called");

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newID = new mongoose.Types.ObjectId();

        const newUser = await User.create({
            _id: newID,
            username: username,
            password: hashedPassword,
            email: email,
            created_at: Date.now(),
            updated_at: Date.now()
        });

        writeLog("Success", `new user created: '${newUser._id}'`);

        return res.status(201).json({
            message: "New User Created",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                created_at: newUser.created_at,
                updated_at: newUser.updated_at
            }
        });
    }
    catch (err) {
        writeLog("Error", `error creating user ${err}`);

        if (err.code === 11000) {
            return res.status(409).json({
                error: "Username or email already exists"
            });
        }

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

module.exports = { login, signup };