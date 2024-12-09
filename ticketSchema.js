const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    movieId: String,
    userId : String,
    movieimage: String,
    movieName: String,
    email: String,
    price: String,
    seats:{
        type: []
    }
})

module.exports = mongoose.model('tickets', ticketSchema)