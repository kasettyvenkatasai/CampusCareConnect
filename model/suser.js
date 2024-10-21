const mongoose = require('mongoose');
const adminschema = new mongoose.Schema({
    email: {
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
        required:false
    }
});
const suser = mongoose.model('suser', adminschema);
module.exports= suser