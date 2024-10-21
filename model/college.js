const mongoose = require('mongoose')
const clgschema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    fields:{
        type:Array,
        required:true
    },
    noOfStudents:{
        type:Number,
        required:true
    },
    noOfDoctors:{
        type:Number,
        required:true
    },
    domain:{
        type:String,
        required:true,
        unique:true
    },
    amount:{
        type:Number,
        required:true
    },
    plan:{
        type:Date,
        required:true
    }
    

})
const Collage = mongoose.model('College',clgschema)
module.exports = Collage