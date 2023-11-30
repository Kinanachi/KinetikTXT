// Express Variables
const express = require("express")
const expressValidator = require ("express-validator")
const router = express.Router()

// Password Hashing Variables
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Validation
// It's written out here for the sake of keeping things clean
const validateRegisterForm = 
[
    expressValidator.body('registerEmail').isEmail().withMessage("Invalid Email"),
    expressValidator.body('registerPassword').isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
]

const validateLoginForm = 
[
    expressValidator.body('loginEmail').isEmail().withMessage("Invalid Email"),
]

router.get("/login", (req, res) => 
{
    const showHeader = true
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>L O G  <span class="kinetik-blue">I N</span></h1>
            <p class="italic">and get typing...</p>
        </div>

        <div class = "generic-container">
            <div class = "generic-content50">
                <form class="account-form" id="loginForm" action="/login" method="post">
                    Enter your login details
                    <br>
                    <br>
                    Email
                    <input class="generic-input-bordered" type="email" id="loginEmail" name="loginEmail" required>
                    <br>
                    Password
                    <input class="generic-input-bordered" type="password" id="loginPassword" name="loginPassword" required>
                    <br>
                    <button class="account-input-button" type="submit">Log In</button>
                </form>
            </div>

            <div class = "generic-content50">
                <form class="account-form" id="registerForm" action="/register" method="post">
                    Or register a new account
                    <br>
                    <br>
                    Username
                    <input class="generic-input-bordered" type="text" id="registerUsername" name="registerUsername" required>
                    <br>
                    First Name
                    <input class="generic-input-bordered" type="text" id="registerFirstName" name="registerFirstName" required>
                    <br>
                    Surname
                    <input class="generic-input-bordered" type="text" id="registerSurname" name="registerSurname" required>
                    <br>
                    Email
                    <input class="generic-input-bordered" type="email" id="registerEmail" name="registerEmail" required>
                    <br>
                    Password
                    <input class="generic-input-bordered" type="password" id="registerPassword" name="registerPassword" required>
                    <br>
                    <button class="account-input-button" type="submit">Register Account</button>
                </form>
            </div>
        </div>
    `

    res.render("base", { body: dynamicContent, showHeader})
})

router.post("/login", validateLoginForm, (req, res) => 
{
    console.log("Login Details Submitted")

    // Sanitise and validate
    const errors = expressValidator.validationResult(req)
    if (!errors.isEmpty())
    {
        // This means there was an error with the registration
        return res.redirect("/login?error=login")
    }

    // Login Form Data
    const email = req.sanitize(req.body.loginEmail)
    const password = req.sanitize(req.body.loginPassword)

    // Process the data, authenticate, etc.

    // Redirect to the home page
    res.redirect("/")
})

router.post("/register", validateRegisterForm, (req, res) => 
{
    console.log("Registration Details Submitted")

    // Sanitise and validate
    const errors = expressValidator.validationResult(req)
    if (!errors.isEmpty())
    {
        // This means there was an error with the registration
        return res.redirect("/login?error=register")
    }

    // Register Form Data
    const email = req.sanitize(req.body.registerEmail)
    const password = req.sanitize(req.body.registerPassword)

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, saltRounds)

    // Then store in database
    // DO HERE

    // Redirect to the home page
    res.redirect("/")
})

module.exports = router