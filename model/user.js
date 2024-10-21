const mongoose = require('mongoose');
const userschema = new mongoose.Schema({
    gmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp:{
     type:String,
    },
    college:{
        type:String,
        required:true
    }

});

const User = mongoose.model('userdetails', userschema);
module.exports = User