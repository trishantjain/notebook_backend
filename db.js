const mongoose = require("mongoose");
require('dotenv').config()

const mongoURI = process.env.MONGO_URL;

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log("connected to mongo successfully")
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}

module.exports = connectToMongo;