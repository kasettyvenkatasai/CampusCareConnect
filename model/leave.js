const mongoose = require('mongoose');
const leave = new mongoose.Schema({
    createdfor:{
    type:String,
    required:true
    },
    startdate: {
        type: Date,
        required: true,
        
    },
    enddate: {
        type: Date,
        required: true
    },
    
});
const Leave = mongoose.model('leaves', leave);
module.exports= Leave