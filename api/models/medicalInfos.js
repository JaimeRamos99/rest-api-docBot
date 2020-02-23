"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MedicalInfoModel = new Schema({
    clinicalContext: String,
    testFindRisk: String,
    medicalCenter: String,
    eps: String,
    isDiabetic: Boolean,
    fumador: Boolean,
    abdominalperimeter: [{
        value: Number,
        date: String
    }],
    weight: [{
        value: Number,
        date: String
    }],
    height: String,
    imc: String,
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }
});

module.exports = mongoose.model('MedicalInfo', MedicalInfoModel);