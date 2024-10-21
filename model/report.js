const mongoose = require('mongoose')
const report_structure = mongoose.Schema({
    report:{
        type:String,
        required:true
    },
    createdby:{
     type:String,
     required:true
    },
    createdon:{
        type:Date,
        required:true
    },
    college:{
        type:String,
        required:true
    }
})
const reportdb = mongoose.model('repotslog',report_structure)

module.exports = reportdb