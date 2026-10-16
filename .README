# COMP3123 Assignment 1 'Backend'

## Project
The purpose of this project was to cement our understanding of backend.

### technologies used
- Node.js, runs js on the server
- Express.js, handles http routing, requests and responses
- REST API, to make code more readable, and understandable
- MongoDD, to store data
- Mongoose, to Define Schema
- JOI, to do data validation
- express-rate-limit, To rate limit (make sure certain endpoints dont get flooded all at once)
- dotenv, so that I could store my important data like passwords locally without exposing them.
- JWT, JSON Web Tokens I used for authorization in employees
- Docker, I also used docker to run my database because I was low on system storage.

### Architecture
I did similiar to MVC minus the V.  I Used Controllers, to do the actual heavy lifting of the endpoints,
models to create the schemas. A validation file so that it was wrapped nicely and finally a
utility class which including the logger and rate limiter

# Installation
#### clone repository
```git clone https://github.com/keag42/Assignment1Comp3123```
#### Install Dependencies
navigate to root of the project, run : ```npm install```
#### Configure Environment variables
 1 - locate .env.example
 2 - copy contents to new file called .env
 3 - add your secrets under the placeholder variables
#### Start MongoDB
 1 - open docker desktop
 2 - go to root of project in terminal
 3 - run ```docker compose up -d```
#### Start The Application
from root in terminal run: ```node app.js```
####Test API
open collection in postman and run

## API DOCS
### User Endpoints

#### Sign Up
- **Method:** POST
- **Endpoint:** `/api/v1/user/signup`
- **Description:** Registers a new user.
- **Authentication:** Not required.
- **Validation:** Request body is checked by `signUpValidation`.
- **Rate limiting:** Enabled.

#### Log In
- **Method:** POST
- **Endpoint:** `/api/v1/user/login`
- **Description:** Authenticates a user.
- **Authentication:** Not required.
- **Validation:** Request body is checked by `loginValidation`.
- **Rate limiting:** Enabled.

### Employee Endpoints

#### Get Employees
- **Method:** GET
- **Endpoint:** `/api/v1/emp/employees`
- **Description:** Retrieves employee records.
- **Authentication:** Required.

#### Get Employee by ID
- **Method:** GET
- **Endpoint:** `/api/v1/emp/employees/:eid`
- **Description:** Retrieves a specific employee.
- **Path parameter:** `eid` — Employee ID.
- **Authentication:** Required.
- **Validation:** Employee ID is checked by `employeeIdValidation`.

#### Create Employee
- **Method:** POST
- **Endpoint:** `/api/v1/emp/employees`
- **Description:** Creates a new employee using the supplied JSON body.
- **Authentication:** Required.
- **Validation:** Request body is checked by `employeeValidation`.

#### Update Employee
- **Method:** PUT
- **Endpoint:** `/api/v1/emp/employees/:eid`
- **Description:** Updates an employee using the supplied JSON body.
- **Path parameter:** `eid` — Employee ID.
- **Authentication:** Required.
- **Validation:** Employee ID and request body are validated.

#### Delete Employee
- **Method:** DELETE
- **Endpoint:** `/api/v1/emp/employees`
- **Description:** Deletes an employee.
- **Authentication:** Required.
- **Validation:** Request is checked by `employeeIdValidation`.
## Authentication
#### Signup
well sign up doesnt authenticate you yet because it doesnt know you. but it does validate the incoming data and place in you the DB if its valid.
#### Login
login does authenticate you, using either email+pass or username+pass and checks the DB if any users match the incoming data. Then returns JWT.
#### JWT
a new JWT is created upon each login, even if its the same user. This validates your access in the time at the database state right then.
#### Authorization Header
this is what passes the JWT to middleware for verification
#### Protected Employee Endpoints
These end points dont allow you to use them unless you pass the auth header with a legitimate JWT.

##Authorization
basically my middleware  verfies the JWT and gets their user ID, Next my controller gets all the employees associated with that user ID, Finally Mongo returns the employees
## Security

#### Password hashing
as soon as password is recieved bcrypt hashes the password, before storing or sending elsewhere
#### JWT
upon successful login in you are given a jwt token which you will use as a bearer token to authenticate all employee endpoints
####helmet
helmet is a middleware that helps you set http response headers
#### Rate Limiting
I set the rate limit to 20 requests per minute. a good sweet spot between being able to test, and actual functionality.
#### Input Validation
I used JOI to do my input validation. JOI is nice because it says you from having to write a million if statements and its much more readable.
#### Environment Variables
I used these so that I didnt expose secrets...

## Logging
#### where logs are stored
logs are stored inside a file called app.log which is inside of a folder called logs
#### What info is logged?
all requested info, when an endpoint was attempted, an error it ran into if it did, and a success, also authorization, and logins, all with timestamps.
#### What info was intentionally excluded?
Intentionally excluded per guidelines were passwords, and other relevant data.

## Health Check
the  health check url is http://localhost:3000/health
expected response is  ```200, Status:up, timestamp, how long its been up"