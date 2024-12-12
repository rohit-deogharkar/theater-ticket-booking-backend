const mongoose  = require('mongoose')

const logSchema = new mongoose.Schema({
    userid:String,
    email: String,
    logInTime: String,
    actions:{
        type: []
    },
    logOutTime: String,
})

module.exports = new mongoose.model('logs', logSchema)