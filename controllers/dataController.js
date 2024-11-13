const { response } = require('express')
const Data = require('../models/Data')
const mongoose = require('mongoose')


const addData = async(req, res) =>{
    const {voltage, current, power, energy} = req.body

    try{
        const new_data = await Data.create({voltage, current, power, energy})
        res.status(200).json(new_data)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const  getAllData = async(req, res) =>{
    const data =   await Data.find({})
    res.status(200).json(data)
}

/*const  getData = async(req, res) =>{ 
    const data =   await Data.find({createdAt: })
    res.status(200).json(data)
}*/


module.exports = {
    addData,
    getAllData,
}
