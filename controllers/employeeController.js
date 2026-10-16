const {writeLog} = require("../util/logger");
const {Employee} = require("../models");
const mongoose= require('mongoose');

const employeePath ="/api/v1/emp"
const getEmployees = async (req, res)=>{
    writeLog("info", `${employeePath}/employees GET Called`)

    const emps = await Employee.find({user: req.user.userId}).catch(err => {
        writeLog("error", `Employee listing failed (${err.name})`, req);
        throw err;
    })
    if (!emps) {
        return res.status(400).json({error: "No Employees"});
    }
    writeLog("info", `Employees listed successfully | Count: ${emps.length}`, req);
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
            writeLog("warn", "Employee lookup rejected: not found or not owned by authenticated user", req);
            return res.status(404).json({ error: "Employee not found" });
        }

        writeLog("info", "Employee retrieved successfully", req);
        return res.status(200).json({ employee });
    } catch (err) {
        writeLog("error", `Employee lookup failed (${err.name})`, req);
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
        writeLog("warn", "Employee creation rejected: authenticated user missing", req);
        return res.status(401).json({
            error: "Unauthorized: User information missing"
        });
    }

    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.userId);
        

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

        writeLog("info", "Employee created successfully", req);
        return res.status(201).json({
            message: "Employee created successfully",
            employee: newEmployee
        });

    } catch (err) {
        writeLog("Error", `Employee creation failed (${err.name})`, req);

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
            writeLog("warn", "Employee update rejected: not found or not owned by authenticated user", req);
            return res.status(404).json({
                error: "Employee not found"
            });
        }

        writeLog("info", "Employee updated successfully", req);
        return res.status(200).json({
            message: "Employee updated successfully"
        });

    } catch (err) {
        writeLog("Error", `Employee update failed (${err.name})`, req);

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
            writeLog("warn", "Employee deletion rejected: not found or not owned by authenticated user", req);
            return res.status(404).json({
                error: "Employee not found or unauthorized"
            });
        }

        writeLog("info", "Employee deleted successfully", req);
        return res.status(204).end();

    } catch (err) {
        writeLog("error", `Employee deletion failed (${err.name})`, req);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};



module.exports = {getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee}