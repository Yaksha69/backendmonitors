const mongoose = require('mongoose')

const Schema = mongoose.Schema

const DataSchema = new Schema({
    voltage: {
        type: Number,
        required: true,
    },
    current: {
        type: Number,
        required: true
    },
    power: {
        type: Number,
        required: true
    },
    energy: {
        type: Number,
        required: true
    }
    

}, {timestamps: true})

module.exports = mongoose.model('Data', DataSchema)