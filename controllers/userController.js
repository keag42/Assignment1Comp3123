const {User} = require('../models.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose= require('mongoose');
const { writeLog } = require('../util/logger.js');

const login = async (req, res) => {
    writeLog("info", "Login attempted", req);

    const { username, email, password } = req.body;

    try {
        const query = username ? { username } : { email };
        const foundUser = await User.findOne(query);

        if (!foundUser) {
            writeLog("warn", "Login rejected: invalid credentials", req);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passCorrect = await bcrypt.compare(password, foundUser.password);

        if (!passCorrect) {
            writeLog("warn", "Login rejected: invalid credentials", req);
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

        writeLog("info", "Login successful", req);

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (err) {
        writeLog("error", `Login failed (${err.name})`, req);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
const signup = async (req, res) => {
    const { username, password, email } = req.body;
    writeLog("info", "Signup attempted", req);

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

        writeLog("info", "User created successfully", req);

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
        writeLog(err.code === 11000 ? "warn" : "error", err.code === 11000 ? "Signup rejected: duplicate username or email" : `Signup failed (${err.name})`, req);

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