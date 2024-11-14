const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET


const fetchuser = (req, res, next) => {
    // Sending "auth-token" in header to verify user where Loged In is required
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).json({ error: "Please authonticate using correct token" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        // Sending User details after successfully vefiying user.
        req.user = data.user;
        // Calling function after fetchuser is declared
        next();
    } catch (error) {
        res.status(401).json({ error: "Please authonticate using correct token" })

    }


}



module.exports = fetchuser