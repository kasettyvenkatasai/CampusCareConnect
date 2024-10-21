const mongoose = require('mongoose');
const doctorschema = new mongoose.Schema({
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
        type:String
    },
    college:{
     type:String,
     required:true
    },
    fields:{
        type:String,
        required:true
    }
});
const Doctor = mongoose.model('doctor', doctorschema);
module.exports= Doctor