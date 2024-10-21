const mongoose = require('mongoose');
const accappointment = require('../model/acceptedappointments');
const medicationSchema = new mongoose.Schema({
    createdfor: {
        type: String,
        required: true,
    },
    sno1: String,
    sno2: String,
    medication1: String,
    medication2: String,
    timings1: String,
    timings2: String,
    createdon: {
        type: Date,
        default: Date.now
    },
    bookedon: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: accappointment
    }
});

const prescription = mongoose.model('Prescription', medicationSchema);

module.exports = prescription;
