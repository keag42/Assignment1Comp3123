const {writeLog} = require("../util/logger");
const {Employee} = require("../models");
const mongoose= require('mongoose');
const { storeProfilePicture, removeProfilePicture } = require('../util/profilePicture');

const employeePath ="/api/v1/emp"
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    let storedPicture = null;
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.userId);
        

        // TODO: Check if employee already exists

        const newID = new mongoose.Types.ObjectId();

        storedPicture = await storeProfilePicture(req.profilePicture);
        const newEmployee = await Employee.create({
            _id: newID,
            first_name: first_name,
            last_name: last_name,
            email: email,
            position: position,
            salary: salary,
            date_of_joining: date_of_joining,
            department: department,
            profile_picture: storedPicture,
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
        if (storedPicture) await removeProfilePicture(storedPicture).catch(() => {});
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

    let replacementPicture = null;
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.userId);
        const empId = new mongoose.Types.ObjectId(eid);

        const existing = await Employee.findOne({ _id: empId, user: ownerId });
        if (!existing) {
            writeLog("warn", "Employee update rejected: not found or not owned by authenticated user", req);
            return res.status(404).json({ error: "Employee not found" });
        }
        replacementPicture = await storeProfilePicture(req.profilePicture);
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
                    ...(replacementPicture ? { profile_picture: replacementPicture } : {}),
                    updated_at: Date.now()
                }
            }
        );

        if (result.matchedCount === 0) {
            if (replacementPicture) await removeProfilePicture(replacementPicture);
            writeLog("warn", "Employee update rejected: not found or not owned by authenticated user", req);
            return res.status(404).json({
                error: "Employee not found"
            });
        }
        if (replacementPicture && existing.profile_picture) await removeProfilePicture(existing.profile_picture);

        writeLog("info", "Employee updated successfully", req);
        return res.status(200).json({
            message: "Employee updated successfully"
        });

    } catch (err) {
        if (replacementPicture) await removeProfilePicture(replacementPicture).catch(() => {});
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
        const employee = await Employee.findOne({
            _id: new mongoose.Types.ObjectId(eid),
            user: req.user.userId
        });

        // Employee didn't exist or belonged to another user
        if (!employee) {
            writeLog("warn", "Employee deletion rejected: not found or not owned by authenticated user", req);
            return res.status(404).json({
                error: "Employee not found or unauthorized"
            });
        }
        await Employee.deleteOne({ _id: employee._id, user: req.user.userId });
        if (employee.profile_picture) await removeProfilePicture(employee.profile_picture);

        writeLog("info", "Employee deleted successfully", req);
        return res.status(204).end();

    } catch (err) {
        writeLog("error", `Employee deletion failed (${err.name})`, req);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

const searchEmployee = async (req, res) => {
    writeLog("info", `${employeePath}/employees/search GET called`, req);

    try {
        const query = { user: req.user.userId };
        for (const field of ["department", "position"]) {
            if (req.employeeSearchQuery[field] !== undefined) {
                query[field] = { $regex: escapeRegex(req.employeeSearchQuery[field]), $options: "i" };
            }
        }
        const employees = await Employee.find(query);
        writeLog("info", `Employee search completed | Count: ${employees.length}`, req);
        return res.status(200).json(employees);
    } catch (err) {
        writeLog("error", `Employee search failed (${err.name})`, req);
        return res.status(500).json({ error: "Internal server error" });
    }
}



module.exports = {getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, searchEmployee}
