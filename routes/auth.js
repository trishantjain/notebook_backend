const express = require('express');
const User = require('../models/User');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
require('dotenv').config();

// Sercet key for authorization token
const JWT_SECRET = process.env.JWT_SECRET;

// Creating a user using POST '/api/auth/createuser'
router.post('/createuser', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Enter a valid name').isLength({ min: 6 }),
    body('password', 'set password of atleast 5 character').isLength({ min: 5 })

], async (req, res) => {

    // If there are errors return bad requests and error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check whether this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry! User with email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        // Gettin User Id of the user to sent it to the auth-token to verify user at the time of login
        const data = {
            user: {
                id: user.id
            }
        }
        
        //? Sending a Authorization token to the user after successful login
        // Adding User Id of the user in the auth-token
        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ authToken });

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }

})


// Route 2: Authoticate a user using POST '/api/auth/login'
router.post('/login', [
    body('email', 'Enter a valid email').isLength({ min: 6 }),
    body('password', 'Password cannot be blank').exists({ min: 6 }),
], async (req, res) => {

    let success = false;
    // If there are errors return bad requests and error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false
            return res.status(400).json({ error: "please try to login with correct credentials" });
        }

        //? Comapring Password coming and saved password
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "please try to login with correct credentials" });
        }

        // Checking authorized token
        //? Getting user id and storing it user object
        const data = {
            user: {
                id: user.id
            }
        }
        
        //? Sending a Authorization token to the user after successful login
        // Signing authorization token
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server error occured")
    }
})


// Getting details of loggedIn user using POST '/api/auth/getuser'
//* This route will work if auth-token is verified in "fetchuser.js" 
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        const userId = req.user.id;
        // It will fetch all the details of the loged In user except "password"
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server error occured")
    }
})

module.exports = router
