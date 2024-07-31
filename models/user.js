const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const mongourl = process.env.MONGO_URL;

mongoose.connect(`${mongourl}`);

const UserSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String, 
    age: Number,
    password: String,
    profilepic: {
        type: String,
        default: "default.jpg"
    },
    posts: [
        { type: mongoose.Schema.Types.ObjectId, ref: "post" }
    ]
})

module.exports = mongoose.model('user', UserSchema)