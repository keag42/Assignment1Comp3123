const {writeLog} = require("../util/logger");
const {Employee} = require("../models");
const mongoose= require('mongoose');

const employeePath ="/api/v1/emp"
const getEmployees = async (req, res)=>{
    writeLog("info", `${employeePath}/employees GET Called`)

    const emps = await Employee.find({user: req.user.userId})
    if (!emps) {
        return res.status(400).json({error: "No Employees"});
    }
    return res.status(200).json({emps});
};


const getEmployeeById = async (req, res) => {
    writeLog("info", "/api/v1/emp/employees/:eid GET Called");

    try {
        const employee = await Employee.findOne({
            _id: req.params.eid,
            user: req.user.userId
        });

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        return res.status(200).json({ employee });
    } catch (err) {
        writeLog("error", `Error fetching employee: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const createEmployee = async (req, res) => {
    writeLog("info", "/api/v1/emp/employees POST Called");

    const {
        first_name, last_name, email, position,
        salary, date_of_joining, department
    } = req.body;

    if (!req.user?.userId) {
        return res.status(401).json({
            error: "Unauthorized: User information missing"
        });
    }

    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.userId);
        console.log(`ID: ${ownerId}`);

        // TODO: Check if employee already exists

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
            user: ownerId,
            created_at: Date.now(),
            updated_at: Date.now()
        });

        return res.status(201).json({
            message: "Employee created successfully",
            employee: newEmployee
        });

    } catch (err) {
        writeLog("Error", `Error creating employee: ${err}`);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

const updateEmployee = async (req, res) => {
    writeLog("info", "/api/v1/emp/employees PUT Called");

    const { eid } = req.params;
    const {
        first_name, last_name, email, position,
        salary, date_of_joining, department
    } = req.body;

    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.userId);
        const empId = new mongoose.Types.ObjectId(eid);

        const result = await Employee.updateOne(
            // Find employee by ID and owner
            {
                _id: empId,
                user: ownerId
            },
            // Update employee fields
            {
                $set: {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    position: position,
                    salary: salary,
                    date_of_joining: date_of_joining,
                    department: department,
                    updated_at: Date.now()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Employee not found"
            });
        }

        return res.status(200).json({
            message: "Employee updated successfully"
        });

    } catch (err) {
        writeLog("Error", `Error updating employee: ${err}`);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

const deleteEmployee = async (req, res) => {
    writeLog("info", "/api/v1/emp/employees?eid DELETE called");

    const eid = req.query.eid;

    try {
        const result = await Employee.deleteOne({
            _id: new mongoose.Types.ObjectId(eid),
            user: req.user.userId
        });

        // Employee didn't exist or belonged to another user
        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Employee not found or unauthorized"
            });
        }

        return res.status(204).end();

    } catch (err) {
        writeLog("error", `Error deleting employee: ${err}`);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};



module.exports = {getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee}